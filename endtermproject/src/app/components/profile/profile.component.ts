import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable, switchMap, of, map, startWith, take, Subject, takeUntil } from 'rxjs';
import { User } from 'firebase/auth';
import { ProfileService } from '../../services/profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ProfileDisplayData {
  uid: string;
  email: string;
  photoURL?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html', 
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule, TranslatePipe]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user$!: Observable<User | null>;
  profileData$!: Observable<ProfileDisplayData | null>;
  uploading = false;
  uploadError: string | null = null;
  previewUrl: string | null = null;
  private destroy$ = new Subject<void>();
  private refreshTrigger$ = new Subject<void>();
  private imageWorker: Worker | null = null;

  // Константы для валидации
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.currentUser$;
    
    // Показываем данные из Auth сразу, затем подтягиваем Firestore (если есть)
    // refreshTrigger$ позволяет обновлять данные после загрузки фото
    this.profileData$ = this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const base: ProfileDisplayData = { uid: user.uid, email: user.email || '' };

        return this.refreshTrigger$.pipe(
          startWith(undefined),
          switchMap(() => 
            this.profileService.ensureUserProfile(user.uid, base.email).pipe(
              switchMap(() => this.profileService.getUserProfile(user.uid)),
              map(profile => ({
                uid: user.uid,
                email: profile?.email || base.email,
                photoURL: profile?.photoURL
              }) as ProfileDisplayData),
              // Сначала отдаем данные из Auth, чтобы не держать спиннер
              // даже если Firestore задерживается/офлайн.
              // Ошибки внутри ensure/get уже логируются и глушатся.
              startWith<ProfileDisplayData>(base)
            )
          )
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshTrigger$.complete();
    if (this.imageWorker) {
      this.imageWorker.terminate();
    }
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    // Валидация типа файла
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError = 'Invalid file type. Please use JPEG, PNG or WebP images.';
      input.value = '';
      return;
    }

    // Валидация размера файла
    if (file.size > this.MAX_FILE_SIZE) {
      this.uploadError = `File is too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB.`;
      input.value = '';
      return;
    }

    // Очистка предыдущего превью
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    // Создание превью
    this.previewUrl = URL.createObjectURL(file);
    this.uploadError = null;

    // Загрузка с компрессией
    this.uploadWithCompression(file, input);
  }

  private uploadWithCompression(file: File, input: HTMLInputElement) {
    this.uploading = true;
    this.uploadError = null;

    // Инициализация worker для компрессии
    if (!this.imageWorker) {
      this.imageWorker = new Worker(
        new URL('../../workers/image-compressor.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }

    // Обработка сообщений от worker
    const workerMessage$ = new Observable<{ compressedBlob?: Blob; originalFileName?: string; error?: string }>(observer => {
      const handler = (e: MessageEvent) => {
        observer.next(e.data);
        observer.complete();
      };
      const errorHandler = (error: ErrorEvent) => {
        observer.error(new Error(error.message || 'Compression failed'));
      };
      
      this.imageWorker!.addEventListener('message', handler);
      this.imageWorker!.addEventListener('error', errorHandler);
      
      return () => {
        this.imageWorker!.removeEventListener('message', handler);
        this.imageWorker!.removeEventListener('error', errorHandler);
      };
    });

    // Отправка файла в worker
    this.imageWorker.postMessage({ file, quality: 0.7 });

    // Обработка результата компрессии
    workerMessage$.pipe(take(1)).subscribe({
      next: (result) => {
        if (result.error) {
          this.uploading = false;
          this.uploadError = result.error;
          return;
        }

        if (!result.compressedBlob) {
          this.uploading = false;
          this.uploadError = 'Compression failed';
          return;
        }

        // Конвертация Blob в File
        const compressedFile = new File(
          [result.compressedBlob],
          result.originalFileName || file.name,
          { type: 'image/jpeg' }
        );

        // Загрузка сжатого файла
        this.auth.currentUser$.pipe(take(1)).subscribe(user => {
          if (!user) {
            this.uploading = false;
            this.uploadError = 'Not authenticated';
            return;
          }

          this.profileService.uploadProfilePicture(user.uid, compressedFile).subscribe({
            next: (photoURL) => {
              this.uploading = false;
              this.uploadError = null;
              input.value = '';
              
              // Обновление превью на новый URL
              if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(this.previewUrl);
              }
              this.previewUrl = null; // Очищаем превью, так как теперь используем реальный URL
              
              // Триггерим обновление данных профиля
              this.refreshTrigger$.next();
            },
            error: err => {
              this.uploading = false;
              // Извлекаем понятное сообщение об ошибке
              let errorMsg = 'Upload failed';
              if (err?.message) {
                errorMsg = err.message;
              } else if (typeof err === 'string') {
                errorMsg = err;
              } else if (err?.error?.message) {
                errorMsg = err.error.message;
              }
              this.uploadError = errorMsg;
              console.error('Profile upload error:', err);
            }
          });
        });
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.message || 'Compression failed';
      }
    });
  }


  removePreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => alert(err.message || 'Logout failed')
    });
  }
}
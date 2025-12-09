import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable, switchMap, of, take, combineLatest, map } from 'rxjs';
import { User } from 'firebase/auth';
import { ProfileService, UserProfile } from '../../services/profile.service';

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
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user$!: Observable<User | null>;
  profileData$!: Observable<ProfileDisplayData | null>;
  uploading = false;
  uploadError: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.currentUser$;
    
    // Объединяем данные из Auth и Firestore
    this.profileData$ = this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        
        // Сначала убеждаемся, что профиль существует, затем получаем его
        return this.profileService.ensureUserProfile(user.uid, user.email || '').pipe(
          switchMap(() => this.profileService.getUserProfile(user.uid)),
          map(profile => {
            // Объединяем данные из Firestore с данными из Auth
            return {
              uid: user.uid,
              email: profile?.email || user.email || '',
              photoURL: profile?.photoURL
            };
          })
        );
      })
    );
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => alert(err.message || 'Logout failed')
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.uploadError = null;
      this.uploading = true;
      this.compressAndUpload(file);
    }
  }

  private compressAndUpload(file: File) {
    if (typeof Worker !== 'undefined') {
      // Создаем Web Worker
      const worker = new Worker(new URL('../../workers/image-compressor.worker', import.meta.url));
      
      worker.onmessage = ({ data }) => {
        if (data.error) {
          this.uploadError = data.error;
          this.uploading = false;
          worker.terminate();
          return;
        }

        const compressedBlob = data.compressedBlob as Blob;
        const compressedFile = new File([compressedBlob], data.originalFileName, { type: compressedBlob.type });

        this.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            // Убеждаемся, что профиль существует перед загрузкой фото
            this.profileService.ensureUserProfile(user.uid, user.email || '').pipe(
              switchMap(() => this.profileService.uploadProfilePicture(user.uid, compressedFile))
            ).subscribe({
              next: () => {
                this.uploading = false;
                worker.terminate();
                // Успех, профиль обновится автоматически через Observable
              },
              error: (err) => {
                this.uploadError = 'Upload failed: ' + err.message;
                this.uploading = false;
                worker.terminate();
              }
            });
          } else {
            worker.terminate();
          }
        });
      };

      worker.onerror = (error) => {
        this.uploadError = 'Worker error: ' + error.message;
        this.uploading = false;
        worker.terminate();
      };

      worker.postMessage({ file, quality: 0.7 });
    } else {
      // Fallback: загрузка без сжатия
      this.uploadError = 'Web Workers not supported. Uploading without compression.';
      this.user$.pipe(take(1)).subscribe(user => {
        if (user) {
          // Убеждаемся, что профиль существует перед загрузкой фото
          this.profileService.ensureUserProfile(user.uid, user.email || '').pipe(
            switchMap(() => this.profileService.uploadProfilePicture(user.uid, file))
          ).subscribe({
            next: () => this.uploading = false,
            error: (err) => {
              this.uploadError = 'Upload failed: ' + err.message;
              this.uploading = false;
            }
          });
        }
      });
    }
  }
}

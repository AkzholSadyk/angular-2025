import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, switchMap, of, map, catchError, defer } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserProfile {
  uid: string;
  email: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService
  ) {}

  private getUserDocRef(uid: string) {
    return doc(this.firestore, `users/${uid}`);
  }

  getUserProfile(uid: string): Observable<UserProfile | undefined> {
    const docRef = this.getUserDocRef(uid);
    return docData(docRef).pipe(
      map(data => {
        if (!data) return undefined;
        return data as UserProfile;
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Создает или обновляет профиль пользователя
   * Если профиля нет, создает его с email из Auth
   */
  ensureUserProfile(uid: string, email: string): Observable<void> {
    const docRef = this.getUserDocRef(uid);
    return defer(() => from(getDoc(docRef))).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          // Создаем новый профиль
          const newProfile: UserProfile = { uid, email };
          return defer(() => from(setDoc(docRef, newProfile))).pipe(
            map(() => undefined as void)
          );
        } else {
          // Обновляем email, если он изменился
          const existingData = docSnap.data() as UserProfile;
          if (existingData.email !== email) {
            return defer(() => from(setDoc(docRef, { ...existingData, email }, { merge: true }))).pipe(
              map(() => undefined as void)
            );
          }
          return of(undefined as void);
        }
      }),
      catchError(err => {
        console.error('Error ensuring user profile:', err);
        return of(undefined as void);
      })
    );
  }

  uploadProfilePicture(uid: string, file: File): Observable<string> {
    // Генерируем безопасное имя файла (убираем пробелы и специальные символы)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const safeFileName = `avatar_${timestamp}.${fileExtension}`;
    const filePath = `profile_pictures/${uid}/${safeFileName}`;
    const storageRef = ref(this.storage, filePath);

    // 1. Загрузка файла в Storage
    return from(uploadBytes(storageRef, file)).pipe(
      // 2. Получение URL
      switchMap(() => from(getDownloadURL(storageRef)) as Observable<string>),
      // 3. Обновление Firestore
      switchMap((photoURL: string) => {
        return this.updateUserProfile(uid, { photoURL }).pipe(
          switchMap(() => of(photoURL)) // Возвращаем URL
        );
      }),
      catchError((error: any): Observable<string> => {
        console.error('Upload error:', error);
        
        // Обработка различных типов ошибок
        let errorMessage = 'Upload failed';
        
        if (error?.code) {
          switch (error.code) {
            case 'storage/unauthorized':
            case 'storage/permission-denied':
              errorMessage = 'Permission denied. Please check Firebase Storage rules. Make sure you are logged in and rules allow uploads to profile_pictures/{userId}/';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was canceled';
              break;
            case 'storage/unknown':
              errorMessage = 'Unknown error occurred during upload';
              break;
            case 'storage/invalid-format':
              errorMessage = 'Invalid file format. Please use JPEG, PNG or WebP images';
              break;
            case 'storage/retry-limit-exceeded':
              errorMessage = 'Upload failed due to network issues. Please try again';
              break;
            default:
              if (error.message) {
                errorMessage = error.message;
              } else if (error.code) {
                errorMessage = `Upload error: ${error.code}`;
              }
          }
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Проверка на HTTP статус коды
        if (error?.status || error?.statusCode) {
          const status = error.status || error.statusCode;
          if (status === 403) {
            errorMessage = 'Access denied (403). Please check Firebase Storage security rules in Firebase Console.';
          } else if (status === 404) {
            errorMessage = 'File not found (404). Please try uploading again.';
          } else if (status === 504) {
            errorMessage = 'Upload timeout (504). The file might be too large or network is slow. Please try again.';
          }
        }
        
        return new Observable<string>(observer => {
          observer.error(new Error(errorMessage));
        });
      })
    );
  }

  updateUserProfile(uid: string, data: Partial<UserProfile>): Observable<void> {
    const docRef = this.getUserDocRef(uid);
    return from(setDoc(docRef, data, { merge: true }));
  }
}

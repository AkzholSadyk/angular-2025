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
    const filePath = `profile_pictures/${uid}/${file.name}`;
    const storageRef = ref(this.storage, filePath);

    // 1. Загрузка файла в Storage
    return from(uploadBytes(storageRef, file)).pipe(
      // 2. Получение URL
      switchMap(() => from(getDownloadURL(storageRef))),
      // 3. Обновление Firestore
      switchMap(photoURL => {
        return this.updateUserProfile(uid, { photoURL }).pipe(
          switchMap(() => of(photoURL)) // Возвращаем URL
        );
      })
    );
  }

  updateUserProfile(uid: string, data: Partial<UserProfile>): Observable<void> {
    const docRef = this.getUserDocRef(uid);
    return from(setDoc(docRef, data, { merge: true }));
  }
}

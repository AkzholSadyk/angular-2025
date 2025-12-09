import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from, switchMap, tap, of, combineLatest, take } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from 'firebase/auth';
import { map } from 'rxjs/operators';

const LOCAL_STORAGE_KEY = 'favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private _favoritesSubject = new BehaviorSubject<number[]>(this.getFavoritesFromLocalStorage());
  public favorites$ = this._favoritesSubject.asObservable();
  
  private _mergeMessageSubject = new BehaviorSubject<string | null>(null);
  public mergeMessage$ = this._mergeMessageSubject.asObservable();

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.loadFavoritesFromFirestore(user.uid).pipe(
            tap(firestoreFavorites => this.mergeFavorites(user.uid, firestoreFavorites))
          );
        } else {
          this._favoritesSubject.next(this.getFavoritesFromLocalStorage());
          return of(null);
        }
      })
    ).subscribe();
  }

  private getFavoritesFromLocalStorage(): number[] {
    const favoritesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  }

  private saveFavoritesToLocalStorage(favorites: number[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    this._favoritesSubject.next(favorites);
  }

  private getFavoritesDocRef(uid: string) {
    return doc(this.firestore, `users/${uid}`);
  }

  private loadFavoritesFromFirestore(uid: string): Observable<number[]> {
    const docRef = this.getFavoritesDocRef(uid);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return (docSnap.data()['favorites'] as number[]) || [];
        }
        return [];
      })
    );
  }

  private saveFavoritesToFirestore(uid: string, itemIds: number[]): Observable<void> {
    const docRef = this.getFavoritesDocRef(uid);
    return from(setDoc(docRef, { favorites: itemIds }, { merge: true }));
  }

  private mergeFavorites(uid: string, firestoreFavorites: number[]): void {
    const localFavorites = this.getFavoritesFromLocalStorage();
    
    // Проверяем, есть ли локальные favorites для merge
    if (localFavorites.length > 0) {
      const mergedFavorites = Array.from(new Set([...localFavorites, ...firestoreFavorites]));
      const mergedCount = mergedFavorites.length - firestoreFavorites.length;
      
      this.saveFavoritesToFirestore(uid, mergedFavorites).pipe(take(1)).subscribe({
        next: () => {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          this._favoritesSubject.next(mergedFavorites);
          
          // Показываем сообщение о merge
          if (mergedCount > 0) {
            this._mergeMessageSubject.next(
              `Your ${mergedCount} local favorite${mergedCount > 1 ? 's' : ''} have been merged with your account favorites!`
            );
            // Автоматически скрываем сообщение через 5 секунд
            setTimeout(() => {
              this._mergeMessageSubject.next(null);
            }, 5000);
          }
        },
        error: (err) => {
          console.error('Error merging favorites:', err);
          this._mergeMessageSubject.next(null);
        }
      });
    } else {
      // Нет локальных favorites для merge, просто загружаем из Firestore
      this._favoritesSubject.next(firestoreFavorites);
    }
  }

  dismissMergeMessage(): void {
    this._mergeMessageSubject.next(null);
  }

  isFavorite(itemId: number): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(itemId))
    );
  }

  toggleFavorite(itemId: number): void {
    const currentFavorites = this._favoritesSubject.value;
    const isFav = currentFavorites.includes(itemId);
    let newFavorites: number[];

    if (isFav) {
      newFavorites = currentFavorites.filter(id => id !== itemId);
    } else {
      newFavorites = [...currentFavorites, itemId];
    }

    this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return this.saveFavoritesToFirestore(user.uid, newFavorites).pipe(
            tap(() => this._favoritesSubject.next(newFavorites))
          );
        } else {
          this.saveFavoritesToLocalStorage(newFavorites);
          return of(null);
        }
      })
    ).subscribe({
      error: (err) => console.error('Error toggling favorite:', err)
    });
  }
}

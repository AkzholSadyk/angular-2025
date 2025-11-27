import { Injectable } from '@angular/core';
import { Auth, user, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.currentUser$ = user(this.auth); 
  }

  signup(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map(res => ({ success: true, user: res.user }))
    );
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(res => ({ success: true, user: res.user }))
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(map(() => ({ success: true })));
  }
}
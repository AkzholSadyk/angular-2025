import { Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.currentUser$ = authState(this.auth);
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then(() => {}));
  }

  signup(email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then(() => {}));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}

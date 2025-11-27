import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="onLogin()">
      <label>Email</label>
      <input [(ngModel)]="email" name="email" type="email" placeholder="Email" required />

      <label>Password</label>
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />

      <button type="submit" [disabled]="loading">Login</button>
      <p *ngIf="error" style="color:red">{{ error }}</p>
      <p *ngIf="loading">Logging in...</p>

      <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
    </form>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = null;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: err => {
        this.error = err.message;
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}

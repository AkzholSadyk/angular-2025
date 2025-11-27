
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})

export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/profile']);
        } else {
          this.error = (res as any).message || 'Login failed';
        }
      },
      error: err => {
        this.loading = false;
        this.error = err.message || 'Server error';
      }
    });
  }
}
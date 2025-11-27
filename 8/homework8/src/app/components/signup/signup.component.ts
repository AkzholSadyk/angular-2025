
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SignupComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  signup() {
    this.loading = true;
    this.auth.signup(this.email, this.password).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/profile']);
        } else {
          this.error = (res as any).message || 'Signup failed';
        }
      },
      error: err => {
        this.loading = false;
        this.error = err.message || 'Server error';
      }
    });
  }
}
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  onSignup() {
    this.loading.set(true);
    this.error.set(null);

    this.auth.signup(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  username: string;
  password: string;
  email: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  username = '';
  password = '';
  email = '';
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password || !this.email) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.find(u => u.username === this.username)) {
      this.errorMessage = 'Username already exists';
      return;
    }

    users.push({ username: this.username, password: this.password, email: this.email });
    localStorage.setItem('users', JSON.stringify(users));

    this.errorMessage = '';
    this.successMessage = 'Registration successful! Redirecting to login...';

    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}

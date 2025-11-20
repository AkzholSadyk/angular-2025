import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {
  user$ = this.getCurrentUser();

  constructor(private auth: AuthService, private router: Router) {}

  private getCurrentUser() {
    return this.auth.currentUser$; 
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
  }
}

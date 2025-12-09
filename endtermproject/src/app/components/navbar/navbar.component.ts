
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Observable, switchMap, of } from 'rxjs';
import { UserProfile } from '../../services/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  profile$: Observable<UserProfile | undefined>;

  constructor(
    public auth: AuthService,
    private profileService: ProfileService
  ) {
    this.profile$ = this.auth.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.profileService.getUserProfile(user.uid);
        }
        return of(undefined);
      })
    );
  }

  logout() {
    this.auth.logout();
  }
}
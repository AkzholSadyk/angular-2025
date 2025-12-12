
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PushService } from '../../services/push.service';
import { I18nService } from '../../services/i18n.service';
import { ProfileService } from '../../services/profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, of, map } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, TranslatePipe,FormsModule]
})
export class NavbarComponent implements OnInit {
  currentLang$;
  userAvatar$: Observable<string | null>;

  constructor(
    public auth: AuthService,
    private push: PushService,
    private i18nService: I18nService,
    private profileService: ProfileService
  ) {
    this.currentLang$ = this.i18nService.currentLang$;
    this.userAvatar$ = of(null);
  }

  ngOnInit(): void {
    // Получаем аватар пользователя из профиля
    this.userAvatar$ = this.auth.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        return this.profileService.getUserProfile(user.uid).pipe(
          map(profile => profile?.photoURL || null)
        );
      })
    );
  }

  setLang(lang: 'en' | 'ru' | 'kz') {
    this.i18nService.setLang(lang);
  }

  async enableNotifications() {
    try {
      const perm = await this.push.requestPermission();
      if (perm === 'granted') {
        this.push.showDemo();
      } else {
        alert('Notifications permission denied');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Notifications not supported');
    }
  }

  logout() {
    this.auth.logout();
  }
}
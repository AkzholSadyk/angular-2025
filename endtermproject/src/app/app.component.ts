import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FavoritesService } from './services/favorites.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isOnline = navigator.onLine;
  showOfflineMessage = false;
  mergeMessage$: Observable<string | null>;

  constructor(
    private swUpdate: SwUpdate,
    private favoritesService: FavoritesService
  ) {
    this.mergeMessage$ = this.favoritesService.mergeMessage$;
  }

  dismissMergeMessage(): void {
    this.favoritesService.dismissMergeMessage();
  }

  ngOnInit(): void {
    window.addEventListener('online', () => this.isOnline = true);
    window.addEventListener('offline', () => this.isOnline = false);

    // Проверка на доступность Service Worker
    if (this.swUpdate.isEnabled) {
      // Подписка на события, связанные с Service Worker
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        // Здесь можно уведомить пользователя о новой версии
        console.log('New version available. Reloading...');
        // document.location.reload();
      });
    }
  }
}
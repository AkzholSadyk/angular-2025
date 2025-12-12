import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  constructor() {}

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    return permission;
  }

  showDemo(): void {
    if (Notification.permission === 'granted') {
      new Notification('Notifications Enabled', {
        body: 'You will now receive push notifications',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  }
}


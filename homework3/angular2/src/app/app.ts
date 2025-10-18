import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class App {
  title = 'About Our Team';
  mission = 'We build delightful software';
  photoUrl = 'https://placekitten.com/200/200';
  isButtonDisabled = false;

  likes = 0;
  showMessage = false;

  name = '';
  email = '';
  subscribed = false;

  like(): void {
    this.likes++;
  }

  toggleMessage(): void {
    this.showMessage = !this.showMessage;
  }

  subscribe(): void {
    this.subscribed = true;
  }
}

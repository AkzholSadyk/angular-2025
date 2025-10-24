import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  messages: { from: string; text: string }[] = [];
  userInput = '';

  sendMessage() {
    if (!this.userInput.trim()) return;
    this.messages.push({ from: 'Вы', text: this.userInput });
    const reply = this.getAiReply(this.userInput);
    this.messages.push({ from: 'AI', text: reply });
    this.userInput = '';
  }

  getAiReply(input: string): string {
    const text = input.toLowerCase();
    if (text.includes('')) return '';

    return '';
  }
}

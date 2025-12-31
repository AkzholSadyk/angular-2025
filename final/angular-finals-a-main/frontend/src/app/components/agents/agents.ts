import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsApiService } from '../../api/tickets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-agents-page',
  templateUrl: './agents.html',
  styleUrl: './agents.css',
})
export class Agents {
  private api = inject(TicketsApiService);
  agents$ = this.api.getAgents();

  // date filter state
  activeRange: 'today' | 'week' | 'month' | 'custom' = 'today';
  toDate: Date | null = null;

  get toDateString(): string {
    if (!this.toDate) return '';
    // format YYYY-MM-DD for date input value
    const y = this.toDate.getFullYear();
    const m = String(this.toDate.getMonth() + 1).padStart(2, '0');
    const d = String(this.toDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  setRange(range: 'today' | 'week' | 'month') {
    this.activeRange = range;
    this.toDate = this.computeToDateForRange(range);
  }

  onToDateChange(value: string) {
    this.toDate = value ? new Date(value + 'T23:59:59') : null;
    this.activeRange = this.toDate ? 'custom' : this.activeRange;
  }

  private computeToDateForRange(range: 'today' | 'week' | 'month'): Date {
    const now = new Date();
    const to = new Date(now);
    if (range === 'today') {
      // today at 23:59
      to.setHours(23, 59, 59, 0);
    } else if (range === 'week') {
      // end of this week (Sunday) at 23:59
      const day = to.getDay(); // 0 (Sun) - 6 (Sat)
      const daysToSunday = (7 - day) % 7;
      to.setDate(to.getDate() + daysToSunday);
      to.setHours(23, 59, 59, 0);
    } else {
      // month: last day of month at 23:59
      const year = to.getFullYear();
      const month = to.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      to.setDate(lastDay);
      to.setHours(23, 59, 59, 0);
    }
    return to;
  }

  initials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '?';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  avatarBg(seed: string): string {
    // deterministic hue from id
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  }
}

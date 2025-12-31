// src/app/pages/tickets/tickets.page.ts
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  combineLatest,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketsApiService } from '../../api/tickets-api.service';
import { TicketStatus } from '../../models/ticket.model';

type FilterStatus = TicketStatus & 'all';

const DEFAULTS = {
  page: 1,
  limit: 10,
  status: 'all' as FilterStatus,
  q: '',
  agentId: 'all',
  priority: 'all',
};

function asInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type PageBtn = { type: 'page'; key: string; value: number } | { type: 'dots'; key: string };

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  selector: 'app-tickets-page',
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private api = inject(TicketsApiService);
  agents$ = this.api.getAgents();

  readonly PRIORITIES = ['all', 'low', 'medium', 'high', 'critical'] as const;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);


  qCtrl = new FormControl('', { nonNullable: true });
  statusCtrl = new FormControl<FilterStatus>('all' as FilterStatus, { nonNullable: true });
  agentCtrl = new FormControl<string | 'all'>('all', { nonNullable: true });
  priorityCtrl = new FormControl<string | 'all'>('all', { nonNullable: true });

 
  private qp$ = this.route.queryParamMap.pipe(
    map((p) => ({
      page: asInt(p.get('page'), DEFAULTS.page),
      limit: asInt(p.get('limit'), DEFAULTS.limit),
      status: p.get('status') as FilterStatus,
  agentId: (p.get('agentId') as string) || DEFAULTS.agentId,
  priority: (p.get('priority') as string) || DEFAULTS.priority,
      q: (p.get('q') ?? DEFAULTS.q).trim(),
    })),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.qp$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ q, status, agentId, priority }) => {
      if (this.qCtrl.value !== q) this.qCtrl.setValue(q, { emitEvent: false });
      if (this.statusCtrl.value !== status) this.statusCtrl.setValue(status, { emitEvent: false });

      if (this.agentCtrl.value !== (agentId || 'all')) this.agentCtrl.setValue(agentId || 'all', { emitEvent: false });
      if (this.priorityCtrl.value !== (priority || 'all')) this.priorityCtrl.setValue(priority || 'all', { emitEvent: false });
    });

    const q$ = this.qCtrl.valueChanges.pipe(
      startWith(this.qCtrl.value),
      debounceTime(300),
      map((v) => v.trim()),
      distinctUntilChanged()
    );

    const status$ = this.statusCtrl.valueChanges.pipe(
      startWith(this.statusCtrl.value),
      distinctUntilChanged()
    );

  const agent$ = this.agentCtrl.valueChanges.pipe(startWith(this.agentCtrl.value), distinctUntilChanged());
  const priority$ = this.priorityCtrl.valueChanges.pipe(startWith(this.priorityCtrl.value), distinctUntilChanged());

    combineLatest([q$, status$, agent$, priority$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([q, status, agent, priority]) => {
        this.setQuery({
          q: q ?? undefined,
          status: status ?? undefined,
          agentId: agent ?? undefined,
          priority: priority ?? undefined,
          page: 1,
        });
      });
  }

  res$ = this.qp$.pipe(
    switchMap(({ page, limit, status, q, agentId, priority }) =>
      // b
      this.api.getTickets({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        q: q || undefined,
        agentId: agentId === 'all' ? undefined : agentId,
        priority: priority === 'all' ? undefined : priority,
      })
    ),
    // b
    shareReplay({ bufferSize: 1, refCount: true })
  );

  setPage(page: number) {
    this.qp$.pipe(takeUntilDestroyed(this.destroyRef), startWith(null as any)).subscribe(); // no-op safeguard
    this.setQuery({ page });
  }

  goPrev(page: number) {
    if (page > 1) this.setQuery({ page: page - 1 });
  }

  pageButtons(page: number, total: number): PageBtn[] {
    if (total <= 1) return [];

    const addPage = (arr: PageBtn[], v: number) =>
      arr.push({ type: 'page', key: `p${v}`, value: v });

    const addDots = (arr: PageBtn[], k: string) => arr.push({ type: 'dots', key: `d${k}` });

    const out: PageBtn[] = [];
    const clamp = (v: number) => Math.max(1, Math.min(total, v));

    const core = new Set<number>([1, 2, total - 1, total, clamp(page - 1), page, clamp(page + 1)]);

    const pages = Array.from(core)
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);

    let prev = 0;
    for (const p of pages) {
      if (prev && p - prev > 1) addDots(out, `${prev}_${p}`);
      addPage(out, p);
      prev = p;
    }
    return out;
  }
  goNext(page: number, totalPages: number) {
    if (page < totalPages) this.setQuery({ page: page + 1 });
  }

  private setQuery(
    partial: Partial<{ page: number; limit: number; status: FilterStatus; q: string; agentId: string; priority: string }>
  ) {
    const cur = this.route.snapshot.queryParamMap;
    const merged = {
      page: asInt(cur.get('page'), DEFAULTS.page),
      limit: asInt(cur.get('limit'), DEFAULTS.limit),
      status: (cur.get('status') as FilterStatus) || '',
      q: (cur.get('q') ?? DEFAULTS.q).trim(),
      agentId: (cur.get('agentId') as string) || 'all',
      priority: (cur.get('priority') as string) || 'all',
      ...partial,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: merged,
      queryParamsHandling: '',
    });
  }
}

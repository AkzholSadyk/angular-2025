import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  map,
  switchMap,
  tap,
  Subject,
  BehaviorSubject,
  merge,
  scan,
  exhaustMap,
  finalize,
  of,
  catchError,
  shareReplay,
} from 'rxjs';
import { TicketsApiService } from '../../api/tickets-api.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.css',
})
export class TicketDetails {
  private route = inject(ActivatedRoute);
  private api = inject(TicketsApiService);
  private destroyRef = inject(DestroyRef);
  id$ = this.route.paramMap.pipe(map((p) => p.get('id') || ''));

 
  private action$ = new Subject<{ ticketId: string; status: string; comment: string }>();
  private actionLoading$ = new BehaviorSubject(false);
  actionLoading = this.actionLoading$.asObservable();
  actionError$ = new BehaviorSubject<string | null>(null);

  
  statusCtrl = new FormControl('', { nonNullable: true });
  commentCtrl = new FormControl('', { nonNullable: true });

  
  ticket$ = this.id$.pipe(
    switchMap((id) => this.api.getTicket(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  
  ticketMerged$ = merge(
    this.ticket$,
    this.action$.pipe(
      exhaustMap((p) =>
        this.api.patchTicket(p.ticketId, { status: p.status, comment: p.comment }).pipe(
          catchError((err) => {
            this.actionError$.next(err?.error?.error || String(err));
            return of(null);
          })
        )
      )
    )
  ).pipe(
 
    scan((acc, v) => (v ? { ...(acc || {}), ...(v as any) } : acc), null as any),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  logs$ = merge(
    this.id$.pipe(switchMap((id) => this.api.getTicketLog(id).pipe(map((r: any) => r.items)))),
    
    this.action$.pipe(switchMap((p) => this.api.getTicketLog(p.ticketId).pipe(map((r: any) => r.items))))
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor() {
    
    this.ticketMerged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((t) => {
      if (t && this.statusCtrl.value !== t.status) this.statusCtrl.setValue(t.status, { emitEvent: false });
      
      this.commentCtrl.setValue('');
    });

   
    this.action$
      .pipe(
        exhaustMap((p) => {
          this.actionError$.next(null);
          this.actionLoading$.next(true);
          return this.api.patchTicket(p.ticketId, { status: p.status, comment: p.comment }).pipe(
            tap(() => {}),
            finalize(() => this.actionLoading$.next(false)),
            catchError((err) => {
              this.actionError$.next(err?.error?.error || String(err));
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((updated) => {
        if (updated) {
        }
      });
  }

  submitStatusChange() {
    const status = this.statusCtrl.value;
    const comment = this.commentCtrl.value.trim();
    if (!status) return;
    if (!comment) {
      this.actionError$.next('Comment is required');
      return;
    }


    const ticketId = (this.route.snapshot.paramMap.get('id') as string) || '';
    this.action$.next({ ticketId, status, comment });
  }
}
// b
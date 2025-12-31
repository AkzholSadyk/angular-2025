import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agent } from '../models/agent.model';
import { TicketsListResponse } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.baseUrl}/agents`);
  }
  // b

  getTicket(id: string) {
    return this.http.get(`${this.baseUrl}/tickets/${id}`);
  }

  getTicketLog(ticketId: string) {
    let params = new HttpParams().set('ticketId', ticketId).set('_sort', 'createdAt').set('_order', 'desc');
    return this.http.get(`${this.baseUrl}/tickets-log`, { params });
  }

  patchTicket(id: string, body: { status: string; comment: string }) {
    return this.http.patch(`${this.baseUrl}/tickets/${id}`, body);
  }
// b
  getTickets(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    agentId?: string;
    q?: string;
  }): Observable<TicketsListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      httpParams = httpParams.set(k, String(v));
    });

    return this.http.get<TicketsListResponse>(`${this.baseUrl}/tickets`, {
      params: httpParams,
    });
  }
}

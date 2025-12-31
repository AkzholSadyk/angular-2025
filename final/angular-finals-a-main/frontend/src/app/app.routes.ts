import { Routes } from '@angular/router';
import { Tickets } from './components/tickets/tickets';
import { TicketDetails } from './components/ticket-details/ticket-details';
import { Agents } from './components/agents/agents';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  { path: 'tickets', component: Tickets, title: 'Tickets' },
  { path: 'tickets/:id', component: TicketDetails, title: 'Ticket Details' },
  { path: 'agents', component: Agents, title: 'Agents' },
  { path: '**', redirectTo: 'tickets' },
];

export type IsoDateString = string;

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketLogAction = 'created' | 'status_change' | 'status_changed' | 'reopened';

export type TicketTag =
  | 'billing'
  | 'auth'
  | 'ui'
  | 'api'
  | 'performance'
  | 'security'
  | 'mobile'
  | 'reports';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  agentId: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  tags: TicketTag[];
}

export interface TicketsListResponse {
  items: Ticket[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  action: TicketLogAction;
  from: TicketStatus | null;
  to: TicketStatus;
  comment?: string;
  createdAt: IsoDateString;
}

export interface PatchTicketBody {
  status: TicketStatus;
  comment: string;
}

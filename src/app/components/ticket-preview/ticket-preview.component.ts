import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Ticket } from '../../shared/ticket/ticket';
import dateFormat from 'dateformat';
import { Router } from '@angular/router';
import { TicketService } from '../../shared/ticket/ticket.service';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.component.html',
  styleUrls: ['./ticket-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketPreviewComponent {
  @Input()
  ticket?: Ticket;

  @Input()
  deleting?: boolean;

  constructor(
    private ticketService: TicketService,
    private router: Router,
  ) {}

  select(): void {
    if (this.deleting) {
      this.ticketService.deleteTicket(this.ticket!.getKey());
    } else {
      this.ticketService.selectTicket(this.ticket!.getKey());
      this.router.navigate(['/ticket']);
    }

  }
}

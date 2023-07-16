import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { ChildrenOutletContexts, Router } from '@angular/router';
import { slideInAnimation } from 'src/app/animations';
import { TicketService } from 'src/app/shared/ticket/ticket.service';

@Component({
  selector: 'app-ticket-overview',
  templateUrl: './ticket-overview.component.html',
  styleUrls: ['./ticket-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInAnimation],
})
export class TicketOverviewComponent {
  constructor(
    private contexts: ChildrenOutletContexts,
    public ticketService: TicketService,
  ) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  getTitle() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['title'];
  }
}

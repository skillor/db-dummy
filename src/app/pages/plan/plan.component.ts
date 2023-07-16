import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Ticket } from 'src/app/shared/ticket/ticket';
import { TicketService } from 'src/app/shared/ticket/ticket.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent {
  showDropdown = false;

  @ViewChild('dropdownContent') dropdownContent?: ElementRef;
  @ViewChild('dropdownButton') dropdownButton?: ElementRef;

  constructor(
    public ticketService: TicketService,
  ) { }

  formatTime(t: string): string {
    return Ticket.formatTime(t);
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  clickout(event: any) {
    if (this.dropdownContent?.nativeElement.contains(event.target)) {
      // console.log("clicked inside");
    } else if (this.dropdownButton?.nativeElement.contains(event.target)) {
      this.showDropdown = !this.showDropdown;
    } else {
      this.showDropdown = false;
    }
  }
}

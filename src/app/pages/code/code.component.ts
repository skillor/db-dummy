import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TicketService } from 'src/app/shared/ticket/ticket.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent {
  showDropdown = false;
  clicks = 0;

  @ViewChild('dropdownContent') dropdownContent?: ElementRef;
  @ViewChild('dropdownButton') dropdownButton?: ElementRef;

  constructor(
    public ticketService: TicketService,
  ) { }

  getBarCode(): string {
    if (this.clicks < 4) {
      const t = this.ticketService.getSelectedTicket().getBarCode2();
      if (t !== undefined) return t;
    }
    return this.ticketService.getSelectedTicket().getBarCode();
  }

  @HostListener('document:click', ['$event'])
  click(event: any) {
    this.clicks += 1;
    return this.clicktouch(event);
  }

  @HostListener('document:touchmove', ['$event'])
  clicktouch(event: any) {
    if (this.dropdownContent?.nativeElement.contains(event.target)) {
      // console.log("clicked inside");
    } else if (this.dropdownButton?.nativeElement.contains(event.target)) {
      this.showDropdown = !this.showDropdown;
    } else {
      this.showDropdown = false;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Fahrplan, JourneyService } from 'src/app/shared/journey/journey.service';
import { JourneySection, Ticket, TrainSection } from 'src/app/shared/ticket/ticket';
import { TicketService } from 'src/app/shared/ticket/ticket.service';

@Component({
  selector: 'app-fahrplan',
  templateUrl: './fahrplan.component.html',
  styleUrls: ['./fahrplan.component.scss']
})
export class FahrplanComponent implements OnInit {

  searchPipe$?: Observable<Fahrplan>;

  constructor(
    private router: Router,
    private journeyService: JourneyService,
    private ticketService: TicketService,
  ) {}

  ngOnInit(): void {
    this.searchPipe$ = this.journeyService.searchFahrplan();
  }

  formatTime(t: string): string {
    return Ticket.formatTime(t);
  }

  makeSections(v: TrainSection[]): JourneySection[] {
    return Ticket.makeSections(v);
  }

  async buche(v: TrainSection[]) {
    await this.ticketService.generateTicket(v);
    this.router.navigate(['/ticket']);
  }
}

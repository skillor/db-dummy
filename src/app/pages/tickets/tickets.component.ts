import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, filter, fromEvent, map, switchMap, takeUntil, tap } from 'rxjs';
import dateFormat from 'dateformat';
import { JourneyService } from 'src/app/shared/journey/journey.service';
import { TicketService } from 'src/app/shared/ticket/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements AfterViewInit, OnDestroy {
  deletingTickets = false;

  addTicketNumber = '';
  addTicketLastname = '';
  addingTicket = false;
  loadingTicket = false;
  ngUnsubscribe = new Subject<void>();

  @ViewChild('journeyStart', { static: true })
  journeyStart?: ElementRef;

  journeyStartId = '';

  journeyStartResults: { id: string, name: string }[] = [];

  @ViewChild('journeyEnd', { static: true })
  journeyEnd?: ElementRef;

  journeyEndId = '';

  abfahrt = dateFormat(Date.now(), 'yyyy-mm-dd\'T\'hh:mm');

  journeyEndResults: { id: string, name: string }[] = [];

  constructor(
    public ticketService: TicketService,
    private journeyService: JourneyService,
    private router: Router,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit(): void {
    fromEvent(this.journeyStart?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(1000),
        map(() => this.journeyStart?.nativeElement.value),
        filter((v) => v != ''),
        distinctUntilChanged(),
        switchMap((v) => this.journeyService.searchLocation(v))
      )
      .subscribe((v) => {
        this.journeyStartResults = v;
        this.ref.detectChanges();
      });

    fromEvent(this.journeyEnd?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(1000),
        map(() => this.journeyEnd?.nativeElement.value),
        filter((v) => v != ''),
        distinctUntilChanged(),
        switchMap((v) => this.journeyService.searchLocation(v))
      )
      .subscribe((v) => {
        this.journeyEndResults = v;
        this.ref.detectChanges();
      });
  }

  selectJourneyStart(j: {id: string, name: string}) {
    this.journeyStart!.nativeElement.value = j.name;
    (<any>document.activeElement!).blur();
    this.journeyStartId = j.id;
  }

  selectJourneyEnd(j: {id: string, name: string}) {
    this.journeyEnd!.nativeElement.value = j.name;
    (<any>document.activeElement!).blur();
    this.journeyEndId = j.id;
  }

  sucheTicket() {
    if (!this.journeyStartId || !this.journeyEndId || !this.abfahrt) return;
    this.journeyService.fahrtSuche = {
      fromId: this.journeyStartId,
      toId: this.journeyEndId,
      abfahrt: this.abfahrt,
    };
    this.ticketService.savePerson();
    this.router.navigate(['/fahrplan']);
  }

  async addTicket() {
    if (!this.addTicketNumber || !this.addTicketLastname) return;
    try {
      this.loadingTicket = true;
      await this.ticketService.loadTicketFromDb(this.addTicketNumber, this.addTicketLastname);
      this.loadingTicket = false;
      this.addTicketNumber = '';
      this.addTicketLastname = '';
      this.addingTicket = false;
      this.ref.detectChanges();
    } catch (err) {
      this.loadingTicket = false;
      this.ref.detectChanges();
      alert(String(err));
      throw err;
    }
  }
}

import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TicketPreviewComponent } from './components/ticket-preview/ticket-preview.component';
import { TicketService } from './shared/ticket/ticket.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlanComponent } from './pages/plan/plan.component';
import { CodeComponent } from './pages/code/code.component';
import { TicketOverviewComponent } from './pages/ticket-overview/ticket-overview.component';
import { FormsModule } from '@angular/forms';
import { AutragBearbeitenComponent } from './pages/autrag-bearbeiten/autrag-bearbeiten.component';
import { BahncardsComponent } from './pages/bahncards/bahncards.component';
import { FileService } from './shared/file/file.service';
import { JourneyService } from './shared/journey/journey.service';
import { FahrplanComponent } from './pages/fahrplan/fahrplan.component';
import { AuthorizationComponent } from './pages/authorization/authorization.component';
import { AuthService } from './shared/auth/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    TicketPreviewComponent,
    TicketsComponent,
    PlanComponent,
    CodeComponent,
    TicketOverviewComponent,
    AutragBearbeitenComponent,
    BahncardsComponent,
    FahrplanComponent,
    AuthorizationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 5 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:5000'
    // })
  ],
  providers: [
    TicketService,
    FileService,
    JourneyService,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

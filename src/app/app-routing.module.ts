import { NgModule, inject } from '@angular/core';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { PlanComponent } from './pages/plan/plan.component';
import { CodeComponent } from './pages/code/code.component';
import { TicketOverviewComponent } from './pages/ticket-overview/ticket-overview.component';
import { Routes, RouterModule, ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Router } from '@angular/router';
import { AutragBearbeitenComponent } from './pages/autrag-bearbeiten/autrag-bearbeiten.component';
import { BahncardsComponent } from './pages/bahncards/bahncards.component';
import { FahrplanComponent } from './pages/fahrplan/fahrplan.component';
import { AuthorizationComponent } from './pages/authorization/authorization.component';
import { AuthService } from './shared/auth/auth.service';

export const authGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {
    if (inject(AuthService).isAuthorized()) return true;
    return inject(Router).createUrlTree(['/authorize']);
}

const routes: Routes = [
  { component: AuthorizationComponent, path: 'authorize', data: { animation: 'Left' } },
  { component: TicketsComponent, path: 'tickets', data: { animation: 'Left' }, canActivate: [authGuard] },
  { component: AutragBearbeitenComponent, path: 'auftrag', data: { animation: 'Auftrag' }, canActivate: [authGuard] },
  { component: BahncardsComponent, path: 'bahncards', data: { animation: 'Bahncards' }, canActivate: [authGuard] },
  { component: FahrplanComponent, path: 'fahrplan', data: { animation: 'Fahrplan' }, canActivate: [authGuard] },
  {
    component: TicketOverviewComponent, path: 'ticket', data: { animation: 'Right' }, canActivate: [authGuard], canActivateChild: [authGuard], children: [
      { path: '', redirectTo: 'code', pathMatch: 'full' },
      { component: CodeComponent, path: 'code', data: { animation: 'Left', title: 'Handy-Ticket' } },
      { component: PlanComponent, path: 'plan', data: { animation: 'Right', title: 'Reiseplan' } },
    ]
  },
  { path: '**', redirectTo: '/tickets' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
  })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }

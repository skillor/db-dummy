import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent {
  loading = false;
  authorization = '';

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
  ) {}

  authorize() {
    this.loading = true;
    this.authService.authorize(this.authorization).subscribe((v) => {
      this.loading = false;
      if (v) this.router.navigate(['/tickets']);
      else this.ref.detectChanges();
    });
  }
}

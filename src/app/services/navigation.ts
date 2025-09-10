import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  router: Router = inject(Router);
  constructor() {}
  goToContactForm(offenderNumber: number) {
    this.router.navigate(['/contact-form', offenderNumber]);
  }
}

import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { Offender } from '../../model/Offender';
import { Navigation } from '../../services/navigation';
import { LegalStatus } from '../../model/LegalStatus';

@Component({
  selector: 'app-offender-card',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    RouterLink,
    MatRippleModule,
  ],
  templateUrl: './offender-card.html',
  styleUrl: './offender-card.scss',
})
export class OffenderCard implements OnInit {
  @Input() offender: Offender = {
    offenderNumber: 0,
    defaultOffenderName: {
      firstName: '',
      lastName: '',
    },
    birthDate: new Date(),
    agentId: '',
    image: '',
    offenderAddress: {
      offenderNumber: 0,
      lineOne: '',
      lineTwo: '',
      city: '',
      state: '',
      zipCode: '',
    },
    phone: '',
    lastSuccessfulContactDate: new Date(),
    contactArray: [],
    nextScheduledContactDate: new Date(),
    legalStatus: {} as LegalStatus,
  };
  navigation: Navigation = inject(Navigation);

  constructor() {}
  ngOnInit(): void {}

  onSwipeRight(offenderNumber: number) {
    this.navigation.goToContactForm(offenderNumber);
  }

  rgba(arg0: number, arg1: number, arg2: number, arg3: number): string {
    throw new Error('Method not implemented.');
  }
  centered = false;
  disabled = false;
  unbounded = false;

  radius = 250;
  color = 'rgba(0, 0, 0, 0.1)';
}

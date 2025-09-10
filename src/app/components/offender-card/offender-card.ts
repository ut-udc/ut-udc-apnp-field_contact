import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { Offender } from '../../model/Offender';
import { Navigation } from '../../services/navigation';

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
    firstName: '',
    lastName: '',
    birthDate: new Date(),
    agentId: '',
    image: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    lastSuccessfulContactDate: new Date(),
    contactArray: [],
    nextScheduledContactDate: new Date(),
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

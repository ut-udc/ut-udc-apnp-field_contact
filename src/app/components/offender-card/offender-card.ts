import { Component, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { Offender } from '../../model/Offender';
import { Navigation } from '../../services/navigation';
import { BlobToDataUrlPipe } from '../../pipes/blob-to-data-url-pipe';
import { ContactData } from '../../services/contact-data';
import { of, from, Observable } from 'rxjs';
import { LatestSuccessfulContact } from '../../model/LatestSuccessfulContact';

@Component({
  selector: 'app-offender-card',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    RouterLink,
    MatRippleModule,
    BlobToDataUrlPipe,
    AsyncPipe,
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
    image: new Blob(),
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
    legalStatus: '',
    lastSuccessfulContact: {} as LatestSuccessfulContact,
  };
  navigation: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);

  constructor() {}
  ngOnInit(): void {}

  onSwipeRight(offenderNumber: number) {
    this.navigation.goToContactForm(offenderNumber);
  }

  async blobToDataURL(blob: Blob): Promise<string | null> {
    if (!blob) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
      debugger;
      console.log('Reader: ', reader);
    });
  }

  async getOffenderPhoto(offenderNumber: number) {
    return await this.contactData.photos.get(offenderNumber).then((photo) => {
      return photo?.image;
    });
  }

  async getOffenderPhotoDataURL(
    offenderNumber: number
  ): Promise<string | null> {
    const photo = await this.contactData.photos.get(offenderNumber);
    if (photo?.image) {
      return await this.blobToDataURL(photo.image);
    }
    return null;
  }

  getOffenderPhotoDataURL$(offenderNumber: number): Observable<string | null> {
    return from(
      this.contactData.photos.get(offenderNumber).then((photo) => {
        if (photo?.image) {
          
          return this.blobToDataURL(photo.image);
        }
        return null;
      })
    );
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

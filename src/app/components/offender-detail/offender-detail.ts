import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ContactListingMonth } from '../contact-listing-month/contact-listing-month';
import { MatRippleModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { Offender } from '../../model/Offender';
import { Navigation } from '../../services/navigation';
import { Contact } from '../../model/Contact';
import { ContactData } from '../../services/contact-data';
import { ContactListingCard } from "../contact-listing-card/contact-listing-card";

@Component({
  selector: 'app-offender-detail',
  standalone: true,
  imports: [
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    ContactListingMonth,
    MatRippleModule,
    DatePipe,
    ContactListingCard
],
  templateUrl: './offender-detail.html',
  styleUrl: './offender-detail.scss',
})
export class OffenderDetail implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  navigationService: Navigation = inject(Navigation);
  offender: Offender | undefined = undefined;
  contactList: Contact[] = [];
  contactData: ContactData = inject(ContactData);
  constructor() {
    const offenderNum = Number(this.route.snapshot.params['ofndrNum']);
    
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'add-white',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/add-white.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'location_on',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/location_on.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'phone',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/phone.svg')
    );
    iconRegistry.addSvgIcon(
      'note',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/note.svg')
    );
  }
  async ngOnInit(): Promise<void> {
    const ofndrNum = Number(this.route.snapshot.params['ofndrNum']);
    if (ofndrNum) {
      await this.loadOffenderData(ofndrNum);
      await this.loadContactList(ofndrNum);
    }
  }
  async loadOffenderData(ofndrNum: number): Promise<void> {
    this.offender = await this.navigationService.getCaseloadOffenderById(ofndrNum);
    if (!this.offender) {
      this.offender =
        await this.navigationService.getOtherOffendersOffenderById(ofndrNum);
      console.log('Offender', this.offender);
    }
  }
  async loadContactList(ofndrNum: number): Promise<void> {
    this.contactList =
      await this.contactData.getAllContactsByOffenderNumberDesc(ofndrNum);
  }

  rgba(arg0: number, arg1: number, arg2: number, arg3: number): string {
    throw new Error('Method not implemented.');
  }
  centered = false;
  disabled = false;
  unbounded = false;

  radius = 300;
  color = 'rgba(207, 207, 207, 0.39)';
}

import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatRippleModule} from '@angular/material/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ContactListingCard} from '../contact-listing-card/contact-listing-card';
import {from} from 'rxjs';
import {DetailHeader} from '../detail-header/detail-header';
import {Offender} from '../../models/offender';
import {Contact} from '../../models/contact';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';

@Component({
  selector: 'app-offender-detail',
  standalone: true,
  imports: [
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    MatRippleModule,
    DatePipe,
    ContactListingCard,
    CommonModule,
    DetailHeader,
  ],
  templateUrl: './offender-detail.html',
  styleUrl: './offender-detail.scss',
})
export class OffenderDetail implements OnInit {
  db: Db = inject(Db);
  route: ActivatedRoute = inject(ActivatedRoute);
  path = '/field_contact_bff/api';

  currentOffender: Signal<Offender | undefined> = toSignal(from(
    liveQuery(() => this.db.caseload
      .where('offenderNumber')
      .equals(Number(this.route.snapshot.params['offenderNumber']))
      .first()))
  );
  existingContacts: Signal<Array<Contact> | undefined> = toSignal(from(
    liveQuery(async () => this.db.existingContacts
      .where('offenderNumber')
      .equals(Number(this.route.snapshot.params['offenderNumber'])).reverse()
      .sortBy('contactDate')
    )));
  unsyncedContacts: Signal<Array<Contact> | undefined> = toSignal(from(
    liveQuery(async () => this.db.contacts
      .where('offenderNumber')
      .equals(Number(this.route.snapshot.params['offenderNumber']))
      .toArray()))
  );

  constructor() {
    const offenderNum = Number(this.route.snapshot.params['offenderNumber']);

    effect(async () => {
      if (this.currentOffender()) {
        if (!(this.currentOffender()!.lastSuccessfulContact)) {
          this.db.caseload.update(Number(this.route.snapshot.params['offenderNumber']), {
            lastSuccessfulContact: await this.getLatestOffenderContact(Number(this.route.snapshot.params['offenderNumber']))
          },);
        }
      }
    })

    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
    iconRegistry.addSvgIcon(
      'add-white',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-white.svg')
    );
    iconRegistry.addSvgIcon(
      'location_on',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/location_on.svg')
    );
    iconRegistry.addSvgIcon(
      'phone',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone.svg')
    );
    iconRegistry.addSvgIcon(
      'note',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/note.svg')
    );
  }

  async ngOnInit(): Promise<void> {


  }

  async getLatestOffenderContact(offenderNumber: number) {
    console.log('Fetching latest successful contact for offender number:', (await fetch(this.path +'/latest-successful-contact/' + offenderNumber)).json());
    return (await fetch(this.path +'/latest-successful-contact/' + offenderNumber)).json();
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

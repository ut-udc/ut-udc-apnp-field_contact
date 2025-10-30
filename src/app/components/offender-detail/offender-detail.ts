import {Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatRippleModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {ContactListingCard} from '../contact-listing-card/contact-listing-card';
import {from} from 'rxjs';
import {DetailHeader} from '../detail-header/detail-header';
import {Offender} from '../../models/offender';
import {Contact} from '../../models/contact';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {OffenderNameDetail} from '../offender-name-detail/offender-name-detail';
import {PhoneNumber} from '../phone-number/phone-number';
import {Address} from '../address/address';

@Component({
  selector: 'app-offender-detail',
  standalone: true,
  imports: [
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    MatRippleModule,
    ContactListingCard,
    CommonModule,
    DetailHeader,
    OffenderNameDetail,
    PhoneNumber,
    Address,
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
      .equals(Number(this.route.snapshot.params['offenderNumber'])).reverse()
      .sortBy('contactDate')
  )));

  sortedExistingContacts: Signal<Array<Contact> | undefined> = computed(() => {
    return (this.existingContacts() || []).sort((a, b) => {
      return new Date(b.contactDate).getTime() - new Date(a.contactDate).getTime();
    });
  });

  constructor() {
    effect(async () => {
      if (this.currentOffender()) {
        console.log('currentOffender: ', this.currentOffender());
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
      'add-white',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-white.svg')
    );
  }

  async ngOnInit(): Promise<void> {


  }

  async getLatestOffenderContact(offenderNumber: number) {
    return (await fetch(this.path +'/latest-successful-contact/' + offenderNumber)).json();
  }

  centered = false;
  disabled = false;
  unbounded = false;

  radius = 300;
  color = 'rgba(207, 207, 207, 0.39)';
}

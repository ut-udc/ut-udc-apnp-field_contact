import {Component, inject, OnInit, Signal} from '@angular/core';
import {DetailHeader} from '../detail-header/detail-header';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Db} from '../../services/db';
import {Contact} from '../../models/contact';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';
import {ContactListingCard} from '../contact-listing-card/contact-listing-card';

@Component({
  selector: 'app-notifications',
  imports: [
    DetailHeader,
    MatIconModule,
    ContactListingCard,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  db: Db = inject(Db);
  route: ActivatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  unknownOffenderContacts: Signal<Array<Contact> | undefined> = toSignal(from(
    liveQuery(async () => this.db.contacts
      .where('offenderNumber')
      .equals(0).reverse()
      .sortBy('contactDate')
    )));

  constructor() {}

  ngOnInit() {

  }


}

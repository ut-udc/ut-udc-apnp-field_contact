import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ContactListingMonth } from '../contact-listing-month/contact-listing-month';
import { MatRippleModule } from '@angular/material/core';
import { DatePipe, NgIf, CommonModule, AsyncPipe } from '@angular/common';
import { Offender } from '../../model/Offender';
import { Navigation } from '../../services/navigation';
import { Contact } from '../../model/Contact';
import { ContactData } from '../../services/contact-data';
import { ContactListingCard } from "../contact-listing-card/contact-listing-card";
import { Observable, from, of } from 'rxjs';

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
    ContactListingCard,
    CommonModule
],
  templateUrl: './offender-detail.html',
  styleUrl: './offender-detail.scss',
})
export class OffenderDetail implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  currentOffender = new Observable<Offender>((observer) => {
    this.contactData.getCaseloadOffenderById(Number(this.route.snapshot.params['ofndrNum'])).then((offender) => {
      if (offender) {
        observer.next(offender);
      } else {
        this.contactData.getOtherOffendersOffenderById(Number(this.route.snapshot.params['ofndrNum'])).then((offender) => {
          if (offender) {
            observer.next(offender);
          } else {
            observer.next({} as Offender);
          }
        });
      }
    });
  });
  // currentOffender: Observable<Offender> = new Observable<Offender>();
  contactList: Observable<Contact[]> = new Observable<Contact[]>();
  contactData: ContactData = inject(ContactData);

  constructor() {
    const offenderNum = Number(this.route.snapshot.params['ofndrNum']);
    
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    // this.loadOffenderData(offenderNum);
    this.loadContactList(offenderNum);

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
  async loadContactList(ofndrNum: number): Promise<void> {
    const contacts = await this.contactData.getAllContactsByOffenderNumberDesc(ofndrNum);
    this.contactList = of(contacts);
  }
  async ngOnInit(): Promise<void> {
    console.log('Applicaiton User: ', this.contactData.applicationUserName);
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
function switchMap<T, R>(project: (value: T, index: number) => Observable<R>): import("rxjs").OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(observer => {
      let innerSubscription: any;
      let index = 0;
      const outerSubscription = source.subscribe({
        next(value) {
          if (innerSubscription) {
            innerSubscription.unsubscribe();
          }
          let result$: Observable<R>;
          try {
            result$ = project(value, index++);
          } catch (err) {
            observer.error(err);
            return;
          }
          innerSubscription = result$.subscribe({
            next: val => observer.next(val),
            error: err => observer.error(err),
            complete: () => { /* do nothing */ }
          });
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
      return () => {
        outerSubscription.unsubscribe();
        if (innerSubscription) {
          innerSubscription.unsubscribe();
        }
      };
    });
}


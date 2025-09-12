import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { Offender } from '../../model/Offender';
import { ActivatedRoute } from '@angular/router';
import { Navigation } from '../../services/navigation';
import { ContactData } from '../../services/contact-data';
import { Contact } from '../../model/Contact';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Agent } from '../../model/Agent';
import { Observable, of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DetailHeader } from '../detail-header/detail-header';

@Component({
  selector: 'app-commentary-form',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatDividerModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatListModule,
    MatInputModule,
    ReactiveFormsModule,
    DatePipe,
    AsyncPipe,
    NgIf,
    CommonModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    DetailHeader,
  ],
  templateUrl: './commentary-form.html',
  styleUrl: './commentary-form.scss',
})
export class CommentaryForm implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);
  offenderNumber: number = 0;
  contactId: number = 0;
  errorClass: string = '';

  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(FieldVisitGuidelinesBottomSheet);
  }

  currentContact = new Observable<Contact>((observer) => {
    this.contactData
      .getContactById(Number(this.route.snapshot.params['contactId']))
      .then((contact) => {
        if (contact) {
          observer.next(contact);
        } else {
          observer.next({} as Contact);
        }
      });
  });
  primaryAgent = new Observable<Agent>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData
        .getOfficerById(contact.primaryInterviewer)
        .then((agent) => {
          if (agent) {
            observer.next(agent);
          } else {
            observer.next({} as Agent);
          }
        });
    });
  });
  secondaryAgent = new Observable<Agent>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData
        .getOfficerById(contact.secondaryInterviewer)
        .then((agent) => {
          if (agent) {
            observer.next(agent);
          } else {
            observer.next({} as Agent);
          }
        });
    });
  });
  contactTypeName = new Observable<string>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData
        .getContactTypeDescById(contact.contactTypeId)
        .then((type) => {
          observer.next(type);
        });
    });
  });
  locationName = new Observable<string>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData
        .getLocationDescById(contact.locationId)
        .then((location) => {
          observer.next(location);
        });
    });
  });

  offender?: Offender;

  commentaryForm: FormGroup = new FormGroup({
    wasContactSuccessful: new FormControl<number | null>(null),
    commentary: new FormControl<string | null>(null),
    // commentary1: new FormControl<string | null>(null),
  });

  async onSubmit() {
    if (!navigator.onLine) {
      this.currentContact.subscribe((contact) => {
        contact.formCompleted = true;
        contact.summary = this.commentaryForm.value.commentary ?? '';
        this.contactData.addPostContactToQueue(contact);
        this.contactData.removeContactFromContacts(contact.contactId);
      });
      return;
    } else {
      this.currentContact.subscribe((contact) => {
        contact.formCompleted = true;
        contact.summary = this.commentaryForm.value.commentary ?? '';
        this.contactData.syncContactWithDatabase(contact);
        this.contactData.updateContact(contact);
      });
    }
    window.location.href = 'offender-detail/' + this.offenderNumber;
  }

  async ngOnInit() {
    this.offenderNumber = Number(this.route.snapshot.params['offenderNumber']);
    this.contactId = Number(this.route.snapshot.params['contactId']);
    this.offender = await this.contactData.getCaseloadOffenderById(
      this.offenderNumber
    );
    if (this.contactId > 0) {
      const contact = await this.contactData.getContactById(this.contactId);
      this.currentContact = contact ? of(contact) : this.currentContact;
    } else {
      const contact =
        await this.contactData.getUncompletedContactByOffenderNumber(
          this.offenderNumber
        );
      this.currentContact = contact ? of(contact) : this.currentContact;
    }
    let contact: Contact | undefined;
    if (this.currentContact instanceof Observable) {
      contact = await this.currentContact.toPromise();
    } else {
      contact = this.currentContact as Contact;
    }
    this.commentaryForm.patchValue({
      commentary: contact?.summary ?? '',
    });
    const agent = await this.contactData.getAgentById(
      this.contactData.applicationUserName
    );
  }

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }

  madeContact() {
    this.currentContact.subscribe((contact) => {
      contact.wasContactSuccessful = 1;
      this.contactData.updateContact(contact);
    });
  }

  attemptedContact() {
    this.currentContact.subscribe((contact) => {
      contact.wasContactSuccessful = 0;
      this.contactData.updateContact(contact);
    });
  }
}

@Component({
  selector: 'field-visit-guidelines-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './field-visit-guidelines-bottom-sheet.html',
  styleUrl: './field-visit-guidelines-bottom-sheet.scss',
})
export class FieldVisitGuidelinesBottomSheet {
  private _bottomSheetRef: MatBottomSheetRef<FieldVisitGuidelinesBottomSheet> =
    inject(MatBottomSheetRef<FieldVisitGuidelinesBottomSheet>);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

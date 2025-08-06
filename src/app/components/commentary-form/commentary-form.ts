import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgIf } from '@angular/common';
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


@Component({
  selector: 'app-commentary-form',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    DatePipe,
    NgClass,
    AsyncPipe,
    NgIf,
    CommonModule,
    MatFormFieldModule,
  ],
  templateUrl: './commentary-form.html',
  styleUrl: './commentary-form.scss',
})
export class CommentaryForm implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);
  ofndrNum: number = 0;
  contactId: number = 0;

  currentContact= new Observable<Contact>((observer) => {
    this.contactData.getContactById(Number(this.route.snapshot.params['contactId'])).then((contact) => {
      if (contact) {
        observer.next(contact);
        console.log('Current Contact line 41:', contact);
      } else {
        observer.next({} as Contact);
      }
    });
  });
  primaryAgent= new Observable<Agent>((observer) => {
    this.currentContact.subscribe(contact => {
      this.contactData.getOfficerById(contact.agentId).then((agent) => {
        if (agent) {
          observer.next(agent);
        } else {
          observer.next({} as Agent);
        }
      });
    });
  });
  secondaryAgent= new Observable<Agent>((observer) => {
    this.currentContact.subscribe(contact => {
      this.contactData.getOfficerById(contact.secondaryAgentId).then((agent) => {
        if (agent) {
          observer.next(agent);
        } else {
          observer.next({} as Agent);
        }
      });
    });
  });
  contactTypeName= new Observable<string>((observer) => {
    this.currentContact.subscribe(contact => {
      this.contactData.getContactTypeDescById(contact.contactType).then((type) => {
        observer.next(type);
      });
    });
  });
  locationName= new Observable<string>((observer) => {
    this.currentContact.subscribe(contact => {
      this.contactData.getLocationDescById(contact.location).then((location) => {
        observer.next(location);
      });
    });
  });

  offender?: Offender;

  commentaryForm: FormGroup = new FormGroup({
    commentary: new FormControl<string | null>(null),
  });

  onSubmit() {
    // debugger
    this.currentContact.subscribe((contact) => {
      contact.formCompleted = true;
      contact.commentary = this.commentaryForm.value.commentary ?? '';
      this.contactData.updateContact(contact);
    });
  }

  async ngOnInit() {
    // debugger
    this.ofndrNum = Number(this.route.snapshot.params['ofndrNum']);
    this.contactId = Number(this.route.snapshot.params['contactId']);
    this.offender = await this.contactData.getCaseloadOffenderById(
      this.ofndrNum
    );
    if (this.contactId > 0) {
      const contact = await this.contactData.getContactById(this.contactId);
      this.currentContact = contact ? of(contact) : this.currentContact;
    } else {
      const contact =
        await this.contactData.getUncompletedContactByOffenderNumber(
          this.ofndrNum
        );
      this.currentContact = contact ? of(contact) : this.currentContact;
    }
    this.commentaryForm.patchValue({
      commentary: this.currentContact.subscribe((contact) => {
        return contact.commentary;
      }),
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
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );
  }

  madeContact() {
    this.currentContact
      .subscribe((contact) => {
        contact.wasContactSuccessful = true;
        this.contactData.updateContact(contact);
      });
  }

  attemptedContact() {
    this.currentContact.subscribe((contact) => {
      contact.wasContactSuccessful = false;
      this.contactData.updateContact(contact);
    });
  } 
}

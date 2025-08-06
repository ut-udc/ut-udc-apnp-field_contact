import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { Navigation } from '../../services/navigation';
import { ContactData } from '../../services/contact-data';
import { Offender } from '../../model/Offender';
import { Contact } from '../../model/Contact';
import { Agent } from '../../model/Agent';
import { Select2Model } from '../../model/Select2Model';
import { Select2String } from '../../model/Select2String';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    CommonModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);

  offender: Offender | undefined = undefined;
  contact: Contact | undefined = undefined;

  selectedDateTime: Date = new Date();
  primaryInterviewer: string = '';
  ofndrNum: number = 0;
  contactId: number = 0;

  currentContact: Contact = {
    contactId: 0,
    ofndrNum: 0,
    agentId: '',
    agentFullName: '',
    secondaryAgentId: '',
    secondaryAgentFullName: '',
    contactDate: new Date(),
    contactType: '',
    contactTypeDesc: '',
    location: '',
    locationDesc: '',
    commentary: '',
    formCompleted: false,
    firstPageCompleted: false,
    wasContactSuccessful: false,
  };

  existingIncompleteContact = new Observable<Contact>((observer) => {
    this.contactData
      .getContactById(Number(this.route.snapshot.params['contactId']))
      .then((contact) => {
        if (contact) {
          observer.next(contact);
          console.log('Current Contact line 41:', contact);
        } else {
          observer.next({} as Contact);
        }
      });
  });

  agentList = new Observable<Agent[]>((observer) => {
    this.contactData.getAgentList().then((list) => {
      observer.next(list);
    });
  });
  officerList = new Observable<Agent[]>((observer) => {
    this.contactData.getOfficerList().then((list) => {
      observer.next(list);
    });
  });

  primaryOfficers = new Observable<Select2String[]>((observer) => {
    this.contactData.getInterviewerOptions().then((list) => {
      observer.next(list);
      console.log('Primary Officers line 103:', list);
    });
  });
  secondaryOfficers = new Observable<Select2String[]>((observer) => {
    this.contactData.getInterviewerOptions().then((list) => {
      observer.next(list);
      console.log('Secondary Officers line 103:', list);
    });
  });

  contactTypeList = new Observable<Select2Model[]>((observer) => {
    this.contactData.getListOfContactTypes().then((list) => {
      observer.next(list);
    });
  });
  locationList = new Observable<Select2Model[]>((observer) => {
    this.contactData.getListOfLocations().then((list) => {
      observer.next(list);
      console.log('Location List line 103:', list);
    });
  });

  contactCount = 0;

  primaryInterviewerOptions: Select2String[] = [];
  secondaryInterviewerOptions: Select2String[] = [];

  contactTypeOptions: Observable<Select2Model[]> = this.contactTypeList;
  locationOptions: Observable<Select2Model[]> = this.locationList;

  searchTerm: string = '';
  searchTerm2: string = '';

  async onSubmit() {
    if (this.currentContact.contactId === 0) {
      this.currentContact.firstPageCompleted = true;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        ofndrNum: Number(this.route.snapshot.params['ofndrNum']),
        agentId: this.contactForm.value.primaryInterviewer ?? '',
        agentFullName: '',
        secondaryAgentId: this.contactForm.value.secondaryInterviewer ?? '',
        secondaryAgentFullName: '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactType: this.contactForm.value.contactType ?? '',
        contactTypeDesc: '',
        location: this.contactForm.value.location ?? '',
        locationDesc: '',
        commentary: '',
        formCompleted: false,
        firstPageCompleted: this.currentContact.firstPageCompleted,
        wasContactSuccessful: false,
      };
      this.contactData.addContact(this.currentContact);
    } else if (
      this.currentContact.contactId > 0 &&
      this.currentContact.formCompleted === false
    ) {
      this.currentContact.contactId = this.currentContact.contactId;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        ofndrNum: Number(this.route.snapshot.params['ofndrNum']),
        agentId: this.contactForm.value.primaryInterviewer ?? '',
        agentFullName: '',
        secondaryAgentId: this.contactForm.value.secondaryInterviewer ?? '',
        secondaryAgentFullName: '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactType: this.contactForm.value.contactType ?? '',
        contactTypeDesc: '',
        location: this.contactForm.value.location ?? '',
        locationDesc: '',
        commentary: '',
        formCompleted: false,
        firstPageCompleted: this.currentContact.firstPageCompleted,
        wasContactSuccessful: false,
      };
      this.contactData.updateContact(this.currentContact);
    }

    // console.log(this.contactData.getAllContacts());
  }

  contactForm: FormGroup = new FormGroup({
    contactId: new FormControl<number | null>(null),
    contactDate: new FormControl<Date | null>(null),
    contactTime: new FormControl<Date | null>(null),
    primaryInterviewer: new FormControl<string | null>(null),
    secondaryInterviewer: new FormControl<string | null>(null),
    contactType: new FormControl<string | null>(null),
    location: new FormControl<string | null>(null),
  });

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    console.log(
      'Location List line 144:',
      this.locationList.subscribe((list) => {
        console.log('Location List line 146:', list);
      })
    );

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );

    // Initialize with empty array and then update when promise resolves
    this.contactData.getInterviewerOptions().then((options) => {
      this.primaryInterviewerOptions = options;
      console.log('Primary Interviewer Options line 158:', options);
      this.primaryInterviewerOptions.forEach((option) => {
        console.log('Primary Interviewer Options line 161:', option);
      });
    });
    this.contactData.getInterviewerOptions().then((options) => {
      this.secondaryInterviewerOptions = options;
    });
  }
  dateTimeControl = new FormControl('');
  primaryInterviewerControl = new FormControl('');
  secondaryInterviewerControl = new FormControl('');
  contactTypeControl = new FormControl('');
  contactLocationControl = new FormControl('');

  async ngOnInit() {
    // debugger;
    this.contactCount = await this.contactData.getContactCount();
    
    console.log('Contact id line 180:', this.currentContact.contactId);
    const offenderNum = Number(this.route.snapshot.params['ofndrNum']);
    this.offender = await this.contactData.getCaseloadOffenderById(offenderNum);
    if (!this.offender) {
      this.offender = await this.contactData.getOtherOffendersOffenderById(
        offenderNum
      );
    }
    this.ofndrNum = Number(this.route.snapshot.params['ofndrNum']);
    this.currentContact.ofndrNum = this.ofndrNum;
    this.contactId = Number(this.route.snapshot.params['contactId']);
    if (this.contactId || this.contactId > 0) {
      const contact = await this.contactData.getContactById(this.contactId);
      this.currentContact = contact ?? this.currentContact;
    } else if (this.ofndrNum > 0) {
      this.contact =
        await this.contactData.getUncompletedContactByOffenderNumber(
          this.ofndrNum
        );
      this.currentContact = this.contact ?? this.currentContact;
    }
    if (this.currentContact.contactId > 0) {

      setTimeout(() => {
      this.contactForm.updateValueAndValidity();

      this.contactForm.patchValue({
        primaryInterviewer: this.contactData.applicationUserName,
        contactId: this.currentContact?.contactId,
        contactDate: this.currentContact?.contactDate,
        contactTime: this.currentContact?.contactDate,
      });
      }, 100);
    } else {
      setTimeout(() => {
        this.currentContact.contactId = this.contactCount + 1;
        this.contactForm.patchValue({
          contactId: this.currentContact?.contactId,
          primaryInterviewer: this.contactData.applicationUserName,
          contactDate: new Date(),
          contactTime: new Date(),
        });
      }, 100);
    }

    this.contactForm = new FormGroup({
      contactDate: this.dateTimeControl,
      contactTime: this.dateTimeControl,
      primaryInterviewer: this.primaryInterviewerControl,
      secondaryInterviewer: this.secondaryInterviewerControl,
      contactType: this.contactTypeControl,
      location: this.contactLocationControl,
    });

    console.log('Contact count', this.contactData.getAllContacts());

    const contactCount = await this.contactData.getContactCount();
    console.log('Contact form', this.contactForm);
    console.log('Contact data', this.currentContact);
  }
  trackOption(index: number, option: any): any {
    return option?.id;
  }
}

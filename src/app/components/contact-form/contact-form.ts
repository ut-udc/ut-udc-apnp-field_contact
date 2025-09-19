import {ChangeDetectionStrategy, Component, inject, OnInit,} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {Observable} from 'rxjs';
import {AsyncPipe, CommonModule, NgForOf, NgIf} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import {DetailHeader} from '../detail-header/detail-header';
import {ContactService} from '../../services/contact-service';
import {Contact} from '../../models/contact';
import {Offender} from '../../models/offender';
import {Agent} from '../../models/agent';
import {Select2Model} from '../../models/select2-model';
import {Select2String} from '../../models/select2-string';

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
    DetailHeader,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  contactService: ContactService = inject(ContactService);

  offender: Offender | undefined = undefined;
  contact: Contact | undefined = undefined;

  selectedDateTime: Date = new Date();
  primaryInterviewer: string = '';
  offenderNumber: number = 0;
  contactId: number = 0;

  currentContact: Contact = {
    contactId: 0,
    offenderNumber: 0,
    primaryInterviewer: '',
    secondaryInterviewer: '',
    contactDate: new Date(),
    contactTime: new Date(),
    contactTimeString: '',
    contactTypeId: 0,
    contactTypeDesc: '',
    locationId: 0,
    locationDesc: '',
    summary: '',
    formCompleted: false,
    firstPageCompleted: false,
    wasContactSuccessful: 2,
    contactSyncedWithDatabase: false,
    userAgent: '',
  };

  agentList = new Observable<Agent[]>((observer) => {
    this.contactService.getAgentList().then((list) => {
      observer.next(list);
    });
  });
  officerList = new Observable<Agent[]>((observer) => {
    this.contactService.getAgentList().then((list) => {
      observer.next(list);
    });
  });

  primaryOfficers = new Observable<Select2String[]>((observer) => {
    this.contactService.getInterviewerOptions().then((list) => {
      observer.next(list);
      console.log('Primary Officers line 103:', list);
    });
  });
  secondaryOfficers = new Observable<Select2String[]>((observer) => {
    this.contactService.getInterviewerOptions().then((list) => {
      observer.next(list);
      console.log('Secondary Officers line 103:', list);
    });
  });

  contactTypeList = new Observable<Select2Model[]>((observer) => {
    this.contactService.getListOfContactTypes().then((list) => {
      observer.next(list);
    });
  });
  locationList = new Observable<Select2Model[]>((observer) => {
    this.contactService.getListOfLocations().then((list) => {
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
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        primaryInterviewer: this.contactForm.value.primaryInterviewer ?? '',
        secondaryInterviewer: this.contactForm.value.secondaryInterviewer ?? '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactTime: this.contactForm.value.contactTime ?? new Date(),
        contactTimeString: '',
        contactTypeId: this.contactForm.value.contactType ?? '',
        contactTypeDesc: '',
        locationId: this.contactForm.value.location ?? '',
        locationDesc: '',
        summary: '',
        formCompleted: false,
        firstPageCompleted: this.currentContact.firstPageCompleted,
        wasContactSuccessful: 2,
        contactSyncedWithDatabase: false,
        userAgent: '',
      };

      this.currentContact.contactId = this.contactCount + 1;
      this.contactService.addContact(this.currentContact);
    } else if (
      this.currentContact.contactId > 0 &&
      this.currentContact.formCompleted === false
    ) {
      this.currentContact.contactId = this.currentContact.contactId;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        primaryInterviewer: this.contactForm.value.primaryInterviewer ?? '',
        secondaryInterviewer: this.contactForm.value.secondaryInterviewer ?? '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactTime: this.contactForm.value.contactTime ?? new Date(),
        contactTimeString: '',
        contactTypeId: this.contactForm.value.contactType ?? '',
        contactTypeDesc: '',
        locationId: this.contactForm.value.location ?? '',
        locationDesc: '',
        summary: '',
        formCompleted: false,
        firstPageCompleted: this.currentContact.firstPageCompleted,
        wasContactSuccessful: 2,
        contactSyncedWithDatabase: false,
        userAgent: '',
      };
      this.contactService.updateContact(this.currentContact);
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

  //This is for the 24-hour clock
  private readonly _adapter =
    inject<DateAdapter<unknown, unknown>>(DateAdapter);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    //set this to GB (Great Britain) locale so the timepicker shows 24-hour format
    this._adapter.setLocale('en-GB');

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );

    // Initialize with empty array and then update when promise resolves
    this.contactService.getInterviewerOptions().then((options) => {
      this.primaryInterviewerOptions = options;
      console.log('Primary Interviewer Options line 158:', options);
      this.primaryInterviewerOptions.forEach((option) => {
        console.log('Primary Interviewer Options line 161:', option);
      });
    });
    this.contactService.getInterviewerOptions().then((options) => {
      this.secondaryInterviewerOptions = options;
    });
  }
  dateTimeControl = new FormControl('', Validators.required);
  primaryInterviewerControl = new FormControl('', Validators.required);
  secondaryInterviewerControl = new FormControl('');
  contactTypeControl = new FormControl('', Validators.required);
  contactLocationControl = new FormControl('', Validators.required);

  async ngOnInit() {
    this.contactCount = await this.contactService.getContactCount();

    console.log('Contact id line 180:', this.currentContact.contactId);
    const offenderNum = Number(this.route.snapshot.params['offenderNumber']);
    this.offender = await this.contactService.getCaseloadOffenderById(offenderNum);
    if (!this.offender) {
      this.offender = await this.contactService.getOtherOffendersOffenderById(
        offenderNum
      );
    }
    this.offenderNumber = Number(this.route.snapshot.params['offenderNumber']);
    this.currentContact.offenderNumber = this.offenderNumber;
    this.contactId = Number(this.route.snapshot.params['contactId']);
    if (this.contactId || this.contactId > 0) {
      const contact = await this.contactService.getContactById(this.contactId);
      this.currentContact = contact ?? this.currentContact;
    } else if (this.offenderNumber > 0) {
      this.contact =
        await this.contactService.getUncompletedContactByOffenderNumber(
          this.offenderNumber
        );
      this.currentContact = this.contact ?? this.currentContact;
    }
    if (this.currentContact.contactId > 0) {
      setTimeout(() => {
        this.contactForm.updateValueAndValidity();

        this.contactForm.patchValue({
          primaryInterviewer: this.currentContact.primaryInterviewer,
          contactId: this.currentContact?.contactId,
          contactDate: this.currentContact?.contactDate,
          contactTime: this.currentContact?.contactTime,
          secondaryInterviewer: this.currentContact?.secondaryInterviewer,
          contactType: this.currentContact?.contactTypeId,
          location: this.currentContact?.locationId,
        });
      }, 100);
    } else {
      setTimeout(() => {
        this.currentContact.contactId = this.contactCount + 1;
        this.contactForm.patchValue({
          contactId: this.currentContact?.contactId,
          primaryInterviewer: this.currentContact.primaryInterviewer,
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

    console.log('Contact count', this.contactService.getAllContacts());

    const contactCount = await this.contactService.getContactCount();
    console.log('Contact form', this.contactForm);
    console.log('Contact data', this.currentContact);
  }
  trackOption(index: number, option: any): any {
    return option?.id;
  }
}

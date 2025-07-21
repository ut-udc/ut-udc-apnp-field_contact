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
import { AsyncPipe } from '@angular/common';
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
import { openDB } from 'idb';

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
    secondaryAgentId: '',
    contactDate: new Date(),
    contactType: '',
    location: '',
    commentary: '',
    formCompleted: false,
    previouslySuccessful: false,
  };

  agentList: Select2Model[] = this.navigationService
    .getOfficerList()
    .map((element) => ({
      id: element.agentId,
      text: element.fullName,
    }));
  contactTypeList: Select2Model[] = this.navigationService.contactTypeList;
  locationList: Select2Model[] = this.navigationService.locationList;

  filteredOptions: Observable<Select2Model[]> = of([...this.agentList]);
  secondaryInterviewerOptions: Observable<Select2Model[]> = of([
    ...this.agentList,
  ]);
  contactTypeOptions: Observable<Select2Model[]> = of([
    ...this.contactTypeList,
  ]);
  locationOptions: Observable<Select2Model[]> = of([...this.locationList]);

  searchTerm: string = '';
  searchTerm2: string = '';

  async onSubmit() {
    // debugger;
    if (this.currentContact.contactId === 0) {
      const contactCount = await this.contactData.getContactCount();
      this.currentContact.contactId = contactCount + 1;
      this.currentContact.previouslySuccessful = true;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        ofndrNum: Number(this.route.snapshot.params['ofndrNum']),
        agentId: this.contactForm.value.primaryInterviewer ?? '',
        secondaryAgentId: this.contactForm.value.secondaryInterviewer ?? '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactType: this.contactForm.value.contactType ?? '',
        location: this.contactForm.value.location ?? '',
        commentary: '',
        formCompleted: false,
        previouslySuccessful: this.currentContact.previouslySuccessful,
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
        secondaryAgentId: this.contactForm.value.secondaryInterviewer ?? '',
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactType: this.contactForm.value.contactType ?? '',
        location: this.contactForm.value.location ?? '',
        commentary: '',
        formCompleted: false,
        previouslySuccessful: this.currentContact.previouslySuccessful,
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

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );
  }
  myControl = new FormControl('');
  myControl1 = new FormControl('');
  myControl2 = new FormControl('');
  myControl3 = new FormControl('');
  myControl4 = new FormControl('');

  async ngOnInit() {
    // debugger;
    const offenderNum = Number(this.route.snapshot.params['ofndrNum']);
    this.offender = await this.navigationService.getCaseloadOffenderById(
      offenderNum
    );
    if (!this.offender) {
      this.offender =
        await this.navigationService.getOtherOffendersOffenderById(offenderNum);
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
        // this.contactForm.updateValueAndValidity();
        this.contactForm.patchValue({
          primaryInterviewer: this.currentContact?.agentId,
          contactId: this.currentContact?.contactId,
          contactDate: this.currentContact?.contactDate,
          contactTime: this.currentContact?.contactDate,
          contactType: this.currentContact?.contactType,
          location: this.currentContact?.location,
          secondaryInterviewer: this.currentContact?.secondaryAgentId,
        });
      }, 100);
    } else {
      setTimeout(() => {
        // this.contactForm.updateValueAndValidity();
        this.contactForm.patchValue({
          primaryInterviewer: this.contactData
            .getAgent()
            .then((agent) => agent?.agentId ?? ''),
          contactDate: new Date(),
          contactTime: new Date(),
        });
      }, 100);
    }

    this.contactForm = new FormGroup({
      contactDate: this.myControl,
      contactTime: this.myControl,
      primaryInterviewer: this.myControl1,
      secondaryInterviewer: this.myControl2,
      contactType: this.myControl3,
      location: this.myControl4,
    });

    console.log('Contact count', this.contactData.getAllContacts());

    const contactCount = await this.contactData.getContactCount();
    console.log('Contact form', this.contactForm);
    console.log('Contact data', this.currentContact);
  }

  private _filter(value: string): Select2Model[] {
    const filterValue = value.toLowerCase();

    // Get the officer list directly from the navigation service and filter it
    return this.navigationService
      .getOfficerList()
      .filter((option: Agent) =>
        option.fullName.toLowerCase().includes(filterValue)
      )
      .map((option: Agent) => ({ id: option.agentId, text: option.fullName }));
  }
}

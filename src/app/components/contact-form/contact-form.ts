import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, Signal,} from '@angular/core';
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
import {AsyncPipe, CommonModule, NgForOf} from '@angular/common';
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
import {UserService} from '../../services/user-service';
import {Db} from '../../services/db';
import {AgentService} from '../../services/agent-service';

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
    CommonModule,
    DetailHeader,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ContactForm implements OnInit {
  db:Db = inject(Db);
  agentService:AgentService = inject(AgentService);
  userService:UserService = inject(UserService);
  route: ActivatedRoute = inject(ActivatedRoute);
  contactService: ContactService = inject(ContactService);

  newDate: Signal<Date> = signal(new Date());

  offender: Offender | undefined = undefined;
  contact: Contact | undefined = undefined;

  selectedDateTime: Date = new Date();
  primaryInterviewer: string = '';
  offenderNumber: number = 0;
  contactId: number = 0;

  primaryInterviewers: Signal<Array<Select2String> |undefined> =  computed(() => {
    let agents: Agent[] = this.agentService.allAgents() ?? [];
    agents = agents.filter(agent => agent.name != null && agent.name !== '');
    agents = agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents?.map(agent => {
      let selectOption: Select2String = {id: agent.userId, text: agent.name};
      return selectOption;
    })
  });
  secondaryInterviewers: Signal<Array<Select2String> |undefined> =  computed(() => {
    let agents: Agent[] = this.agentService.allAgents() ?? [];
    agents = agents.filter(agent => agent.name != null && agent.name !== '');
    agents = agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents?.map(agent => {
        let selectOption: Select2String = {id: agent.userId, text: agent.name};
        return selectOption;
    })
  });

  locationById: Signal<string> = computed(() => {
    return this.agentService.allLocations()?.find(loc => loc.id === this.contactForm.value.location)?.text.trim() ?? '';
  });

  contactTypeById: Signal<string> = computed(() => {
    return this.agentService.allContactTypes()?.find(typ => typ.id === this.contactForm.value.contactType)?.text.trim() ?? '';
  });

  currentContact: Contact = {
    contactId: 0,
    offenderNumber: 0,
    primaryInterviewer: {
      userId: "",
      name: ""
    },
    secondaryInterviewer: {
      userId: "",
      name: ""
    },
    contactDate: this.newDate(),
    contactTime: this.newDate(),
    contactTimeString: '',
    contactTypeId: 0,
    contactType: '',
    result: 99,
    location: '',
    locationId: 0,
    summary: '',
    formCompleted: false,
    firstPageCompleted: false,
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
    });
  });
  secondaryOfficers = new Observable<Select2String[]>((observer) => {
    this.contactService.getInterviewerOptions().then((list) => {
      observer.next(list);
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
    });
  });

  contactCount = 0;

  contactTypeOptions: Observable<Select2Model[]> = this.contactTypeList;
  locationOptions: Observable<Select2Model[]> = this.locationList;

  searchTerm: string = '';
  searchTerm2: string = '';

  async onSubmit() {
    console.log('Submitting...', this.currentContact.offenderNumber, this.currentContact.contactId);

    const hours = this.contactForm.value.contactTime.getHours(); // Get the hour (0-23)
    const minutes = this.contactForm.value.contactTime.getMinutes(); // Get the minute (0-59)
    const seconds = this.contactForm.value.contactTime.getSeconds();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (this.currentContact.contactId === 0) {
      this.currentContact.firstPageCompleted = true;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        primaryInterviewer: {userId: this.contactForm.value.primaryInterviewer ?? '', name: this.primaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.primaryInterviewer)?.text ?? ''},
        secondaryInterviewer: {userId: this.contactForm.value.secondaryInterviewer ?? '', name: this.secondaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.secondaryInterviewer)?.text ?? ''},
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        contactTime: this.contactForm.value.contactTime ?? new Date(),
        contactTimeString: formattedTime,
        contactTypeId: this.contactForm.value.contactType ?? '',
        contactType: this.contactTypeById(),
        location: this.locationById(),
        locationId: this.contactForm.value.location ?? '',
        result: 99,
        summary: '',
        formCompleted: false,
        firstPageCompleted: true,
        contactSyncedWithDatabase: false,
        userAgent: '',
      };

      this.currentContact.contactId = this.contactCount + 1;
      console.log('Contact to save: '+this.currentContact);
      this.contactService.addContactToIdb(this.currentContact);
    } else if (
      this.currentContact.contactId > 0 &&
      this.currentContact.formCompleted === false
    ) {
      this.currentContact.contactId = this.currentContact.contactId;
      this.currentContact = {
        contactId: this.currentContact.contactId,
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        primaryInterviewer: {userId: this.contactForm.value.primaryInterviewer ?? '', name: this.primaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.primaryInterviewer)?.text ?? ''},
        secondaryInterviewer: {userId: this.contactForm.value.secondaryInterviewer ?? '', name: this.secondaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.secondaryInterviewer)?.text ?? ''},
        contactDate: this.contactForm.value.contactDate ?? this.newDate(),
        contactTime: this.contactForm.value.contactTime ?? this.newDate(),
        contactTimeString: formattedTime,
        contactTypeId: this.contactForm.value.contactType ?? '',
        contactType: this.contactTypeById(),
        location: this.locationById(),
        locationId: this.contactForm.value.location ?? '',
        result: 99,
        summary: '',
        formCompleted: false,
        firstPageCompleted: true,
        contactSyncedWithDatabase: false,
        userAgent: '',
      };
      this.contactService.updateContact(this.currentContact);
    }
      // window.location.href = 'commentary-form/', this.currentContact.offenderNumber, this.currentContact.contactId;
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
  contactIdSignal: Signal<number> = signal(0);
  contactDateSignal: Signal<Date> = signal(new Date());
  contactTimeSignal: Signal<Date> = signal(new Date());
  primaryInterviewerSignal: Signal<string> = signal('');
  secondaryInterviewerSignal: Signal<string> = signal('');
  contactTypeSignal: Signal<string> = signal('');
  locationSignal: Signal<string> = signal('');

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

  }
  dateTimeControl = new FormControl('', Validators.required);
  primaryInterviewerControl = new FormControl('', Validators.required);
  secondaryInterviewerControl = new FormControl('');
  contactTypeControl = new FormControl('', Validators.required);
  contactLocationControl = new FormControl('', Validators.required);

  async ngOnInit() {
    this.contactCount = await this.contactService.getContactCount();

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
          primaryInterviewer: this.currentContact.primaryInterviewer?.userId,
          contactId: this.currentContact?.contactId,
          contactDate: this.currentContact?.contactDate,
          contactTime: this.currentContact?.contactTime,
          secondaryInterviewer: this.currentContact?.secondaryInterviewer?.userId,
          contactType: this.currentContact?.contactTypeId,
          location: this.currentContact?.locationId,
        });
      }, 100);
    } else {
      setTimeout(() => {
        this.currentContact.contactId = this.contactCount + 1;
        this.contactForm.patchValue({
          contactId: this.currentContact?.contactId,
          primaryInterviewer: this.agentService.primaryAgent()?.userId,
          contactDate: this.newDate(),
          contactTime: this.newDate(),
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


    const contactCount = await this.contactService.getContactCount();
    console.log('Contact data', this.currentContact);
  }
  trackOption(index: number, option: any): any {
    return option?.id;
  }
}

export default ContactForm

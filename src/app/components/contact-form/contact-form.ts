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
import {map, Observable, startWith} from 'rxjs';
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

  // selectedDateTime: Date = new Date();
  primaryInterviewer: string = '';
  offenderNumber: number = 0;
  contactId: number = 0;

  primaryInterviewers: Signal<Array<Select2String> |undefined> =  computed(() => {
    let agents: Agent[] = this.agentService.allAgents() ?? [];
    agents = agents.filter(agent => agent.name != null && agent.name !== '');
    agents = agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents?.map(agent => {
      let selectOption: Select2String = {id: agent.userId, text: agent.name + ' (' + agent.userId + ')'};
      return selectOption;
    })
  });
  secondaryInterviewers: Signal<Array<Select2String> |undefined> =  computed(() => {
    let agents: Agent[] = this.agentService.allAgents() ?? [];
    agents = agents.filter(agent => agent.name != null && agent.name !== '');
    agents = agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents?.map(agent => {
        let selectOption: Select2String = {id: agent.userId, text: agent.name + ' (' + agent.userId + ')'};
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
    sortDate: this.newDate(),
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

  contactCount = 0;
  contactTypeOptions: Select2Model[] = [];
  filteredContactTypes!: Observable<Select2Model[]>;
  locationOptions: Select2Model[] = [];
  filteredLocations!: Observable<Select2Model[]>;
  primaryInterviewerOptions: Select2String[] = [];
  filterPrimaryInterviewers!: Observable<Select2String[]>;
  secondaryInterviewerOptions: Select2String[] = [];
  filterSecondaryInterviewers!: Observable<Select2String[]>;


  async onSubmit() {
    console.log('Submitting...', this.currentContact.offenderNumber, this.currentContact.contactId);

    // const indexOfPrimaryOpeningParenthesis = this.contactForm.value.primaryInterviewer.indexOf('(');
    // const indexOfPrimaryClosingParenthesis = this.contactForm.value.primaryInterviewer.indexOf(')');
    // const indexOfSecondaryOpeningParenthesis = this.contactForm.value.secondaryInterviewer.indexOf('(');
    // const indexOfSecondaryClosingParenthesis = this.contactForm.value.secondaryInterviewer.indexOf(')');
    // const primaryInterviewerUserId = this.contactForm.value.primaryInterviewer.substring(indexOfPrimaryOpeningParenthesis + 1, indexOfPrimaryClosingParenthesis);
    // const secondaryInterviewerUserId = this.contactForm.value.secondaryInterviewer.substring(indexOfSecondaryOpeningParenthesis + 1, indexOfSecondaryClosingParenthesis);
    // const primaryInterviewerName = this.contactForm.value.primaryInterviewer.substring(0, indexOfPrimaryOpeningParenthesis - 1);
    // const secondaryInterviewerName = this.contactForm.value.secondaryInterviewer.substring(0, indexOfSecondaryOpeningParenthesis - 1);
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
        // primaryInterviewer: {userId: primaryInterviewerUserId ?? '', name: primaryInterviewerName ?? ''},
        // secondaryInterviewer: {userId: secondaryInterviewerUserId ?? '', name: secondaryInterviewerName ?? ''},
        contactDate: this.contactForm.value.contactDate ?? new Date(),
        sortDate: this.contactForm.value.contactDate ?? new Date(),
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
        userAgent: this.agentService.primaryAgent()?.userId || '',
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
        sortDate: this.contactForm.value.contactDate ?? this.newDate(),
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
        userAgent: this.agentService.primaryAgent()?.userId || '',
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

  //This is for the 24-hour clock
  private readonly _adapter =
    inject<DateAdapter<unknown, unknown>>(DateAdapter);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    //set this to GB (Great Britain) locale so the timepicker shows 24-hour format
    this._adapter.setLocale('en-US');

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
  filterContactTypeControl = new FormControl('');
  filterContactLocationControl = new FormControl('');
  filterSecondaryInterviewerControl = new FormControl('');
  filterPrimaryInterviewerControl = new FormControl('');
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
      filterContactType: this.filterContactTypeControl,
      filterLocation: this.filterContactLocationControl,
      filterPrimaryInterviewer: this.filterPrimaryInterviewerControl,
      filterSecondaryInterviewer: this.filterSecondaryInterviewerControl,
    });
    this.primaryInterviewerOptions = this.primaryInterviewers() ?? [];
    this.filterPrimaryInterviewers = this.filterPrimaryInterviewerControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this._filterPrimaryInterviewers(value) : this.primaryInterviewerOptions)
    );
    this.secondaryInterviewerOptions = this.secondaryInterviewers() ??[];
    this.filterSecondaryInterviewers = this.filterSecondaryInterviewerControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this._filterSecondaryInterviewers(value) : this.secondaryInterviewerOptions)
    );
    this.contactTypeOptions = await this.contactService.getListOfContactTypes();
    this.filteredContactTypes = this.filterContactTypeControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this._filterContactTypes(value) : this.contactTypeOptions)
    );
    // Load locations as array
    this.locationOptions = await this.contactService.getListOfLocations();
    // Setup filteredLocations as an Observable reacting to input
    this.filteredLocations = this.filterContactLocationControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this._filterLocations(value) : this.locationOptions)
    );
    const contactCount = await this.contactService.getContactCount();
    console.log('Contact data', this.currentContact);
  }
  trackOption(index: number, option: any): any {
    return option?.id;
  }
  private _filterContactTypes(value: string): Select2Model[] {
    const filterValue = value.toLowerCase();
    return this.contactTypeOptions.filter(option =>
      option.text.toLowerCase().includes(filterValue)
    );
  }
  private _filterLocations(value: string): Select2Model[] {
    const filterValue = value.toLowerCase();
    return this.locationOptions.filter(option =>
      option.text.toLowerCase().includes(filterValue)
    );
  }
  private _filterSecondaryInterviewers(value: string): Select2String[] {
    const filterValue = value.toLowerCase();
    return this.secondaryInterviewerOptions.filter(option =>
      option.text.toLowerCase().includes(filterValue)
    );
  }
  private _filterPrimaryInterviewers(value: string): Select2String[] {
    const filterValue = value.toLowerCase();
    return this.primaryInterviewerOptions.filter(option =>
      option.text.toLowerCase().includes(filterValue)
    );
  }
  getLocationText(id: number | string  | null): string {
    return this.locationOptions.find(option => option.id === id)?.text || 'Select location';
  }
  getContactTypeText(id: number | string  | null): string {
    return this.contactTypeOptions.find(option => option.id === id)?.text || 'Select contact type';
  }
  getSecondaryInterviewerText(id: number | string  | null): string {
    return this.secondaryInterviewerOptions.find(option => option.id === id)?.text || 'Select secondary interviewer';
  }
  getPrimaryInterviewerText(id: number | string  | null): string {
    return this.primaryInterviewerOptions.find(option => option.id === id)?.text || 'Select primary interviewer';
  }
}

export default ContactForm

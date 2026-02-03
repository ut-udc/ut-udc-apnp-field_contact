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
import {Observable, of} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
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
import {FilterableSelect} from '../filterable-select/filterable-select';

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
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    CommonModule,
    DetailHeader,
    FilterableSelect,
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

  availableOffenders: Signal<Array<Select2Model> |undefined> = signal<Array<Select2Model> | undefined>(undefined);

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
    selectedOffender: 0,
    firstName: '',
    lastName: '',
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
    resultDescription: '',
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
  locationOptions: Select2Model[] = [];


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
    const offenderNum = Number(this.route.snapshot.params['offenderNumber']);
    let contactOffenderNum = offenderNum;
    if(offenderNum === 0 && this.currentContact.contactId > 0 && this.contactForm.value.availableOffender != '') {
      contactOffenderNum = this.contactForm.value.availableOffender;
    }
    if (this.currentContact.contactId === 0) {
      this.currentContact.firstPageCompleted = true;
      this.currentContact = {
        firstName: this.contactForm.value.firstName,
        lastName: this.contactForm.value.lastName,
        contactId: this.currentContact.contactId,
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        selectedOffender: contactOffenderNum,
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
        resultDescription: '',
        summary: '',
        formCompleted: false,
        firstPageCompleted: true,
        contactSyncedWithDatabase: false,
        userAgent: this.agentService.primaryAgent()?.userId || '',
      };

      this.currentContact.contactId = this.contactCount + 1;
      console.log('Contact to save: '+this.currentContact);
      await this.contactService.addContactToIdb(this.currentContact);
    } else if (
      this.currentContact.contactId > 0  &&
      !this.currentContact.formCompleted
    ) {
      // this.currentContact.contactId = this.currentContact.contactId;
      this.currentContact = {
        firstName: this.contactForm.value.firstName,
        lastName: this.contactForm.value.lastName,
        contactId: this.currentContact.contactId,
        offenderNumber: Number(this.route.snapshot.params['offenderNumber']),
        selectedOffender: contactOffenderNum,
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
        resultDescription: '',
        summary: '',
        formCompleted: false,
        firstPageCompleted: true,
        contactSyncedWithDatabase: false,
        userAgent: this.agentService.primaryAgent()?.userId || '',
      };
      await this.contactService.updateContact(this.currentContact);
    } else if (
      this.currentContact.contactId > 0  &&
      this.currentContact.formCompleted
    ) {
      this.currentContact.selectedOffender = contactOffenderNum;
      this.currentContact.primaryInterviewer = {userId: this.contactForm.value.primaryInterviewer ?? '', name: this.primaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.primaryInterviewer)?.text ?? ''};
      this.currentContact.secondaryInterviewer = {userId: this.contactForm.value.secondaryInterviewer ?? '', name: this.secondaryInterviewers()?.filter(() => true).find(option => option.id === this.contactForm.value.secondaryInterviewer)?.text ?? ''};
      this.currentContact.contactDate = this.contactForm.value.contactDate ?? this.newDate();
      this.currentContact.sortDate = this.contactForm.value.contactDate ?? this.newDate();
      this.currentContact.contactTime = this.contactForm.value.contactTime ?? this.newDate();
      this.currentContact.contactTimeString = formattedTime;
      this.currentContact.contactTypeId = this.contactForm.value.contactType ?? '';
      this.currentContact.contactType = this.contactTypeById();
      this.currentContact.location = this.locationById();
      this.currentContact.locationId = this.contactForm.value.location ?? '';
      await this.contactService.updateContact(this.currentContact);
    }
      // window.location.href = 'commentary-form/', this.currentContact.offenderNumber, this.currentContact.contactId;
  }

  contactForm: FormGroup = new FormGroup({
    contactId: new FormControl<number | null>(null),
    firstName: new FormControl<string | null>(null),
    lastName: new FormControl<string | null>(null),
    contactDate: new FormControl<Date | null>(null),
    contactTime: new FormControl<Date | null>(null),
    primaryInterviewer: new FormControl<string | null>(null),
    secondaryInterviewer: new FormControl<string | null>(null),
    contactType: new FormControl<string | null>(null),
    location: new FormControl<string | null>(null),
    availableOffender: new FormControl<string | null>(null),
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
  firstNameControl = new FormControl('');
  lastNameControl = new FormControl('');
  availableOffenderControl = new FormControl('');
  dateTimeControl = new FormControl('', Validators.required);
  primaryInterviewerControl = new FormControl('', Validators.required);
  secondaryInterviewerControl = new FormControl('');
  contactTypeControl = new FormControl('', Validators.required);
  contactLocationControl = new FormControl('', Validators.required)

  async ngOnInit() {
    this.contactCount =  await this.contactService.getContactCount();
    this.contactTypeOptions = await this.contactService.getListOfContactTypes();
    this.locationOptions = await this.contactService.getListOfLocations();
    const offenderNum = Number(this.route.snapshot.params['offenderNumber']);
    if(offenderNum || offenderNum > 0) {
      // offender exists → not require first/last name
      this.firstNameControl.clearValidators();
      this.lastNameControl.clearValidators();
      this.availableOffenderControl.clearValidators();
      this.offender = await this.contactService.getCaseloadOffenderById(offenderNum);
      if (!this.offender) {
        this.offender = await this.contactService.getOtherOffendersOffenderById(
          offenderNum
        );
      }
      // FIX → Patch offender name so validation passes
      this.firstNameControl.patchValue(this.offender?.defaultOffenderName?.firstName ?? '');
      this.lastNameControl.patchValue(this.offender?.defaultOffenderName?.lastName ?? '');
      this.offenderNumber = Number(this.route.snapshot.params['offenderNumber']);
      this.currentContact.offenderNumber = this.offenderNumber;
    } else {
      this.offender = undefined;
      this.offenderNumber = 0;
      this.firstNameControl.setValidators([Validators.required]);
      this.lastNameControl.setValidators([Validators.required]);
    }
    // MUST CALL THIS
    this.firstNameControl.updateValueAndValidity();
    this.lastNameControl.updateValueAndValidity();
    this.contactId = Number(this.route.snapshot.params['contactId']);
    if (this.contactId || this.contactId > 0) {
      const contact = await this.contactService.getContactById(this.contactId);
      this.currentContact = contact ?? this.currentContact;
      if(offenderNum === 0 && contact.formCompleted) {
        this.availableOffenderControl.setValidators([Validators.required]);
        this.availableOffenderControl.updateValueAndValidity();
        this.availableOffenders = computed(() => {
          let offenders: Offender[] = this.agentService.myCaseload() ?? [];
          return offenders?.map(offender => {
            let selectOption: Select2Model = {id: offender.offenderNumber, text: offender.defaultOffenderName.firstName + offender.defaultOffenderName.lastName + ' (' + offender.offenderNumber + ')'};
            return selectOption;
          })
        });
      }
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
          firstName: this.currentContact?.firstName,
          lastName: this.currentContact?.lastName,
          availableOffender: this.currentContact?.selectedOffender>0?this.currentContact?.selectedOffender:'',
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
          firstName: '',
          lastName: '',
          primaryInterviewer: this.agentService.primaryAgent()?.userId,
          contactDate: this.newDate(),
          contactTime: this.newDate(),
        });
      }, 100);
    }
    this.contactForm = new FormGroup({
      firstName: this.firstNameControl,
      lastName: this.lastNameControl,
      contactDate: this.dateTimeControl,
      contactTime: this.dateTimeControl,
      primaryInterviewer: this.primaryInterviewerControl,
      secondaryInterviewer: this.secondaryInterviewerControl,
      contactType: this.contactTypeControl,
      location: this.contactLocationControl,
      availableOffender: this.availableOffenderControl,
    });
  }
}

export default ContactForm

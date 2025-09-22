import {Injectable} from '@angular/core';
import Dexie, {Table} from "dexie";
import {Contact} from '../models/contact';
import {QueuedContact} from '../models/queued-contact';
import {Agent} from '../models/agent';
import {OffenderBase} from '../models/offender-base';
import {Offender} from '../models/offender';
import {Select2Model} from '../models/select2-model';
import {ContactSummary} from '../models/contact-summary';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class Db extends Dexie {

  public contacts!: Table<Contact, number>;
  public existingContacts!: Table<Contact, number>;
  public contactsQueue!: Table<QueuedContact, number>;
  public users!: Table<User, string>;
  public agents!: Table<Agent, string>;
  public allOffenders!: Table<OffenderBase, number>;
  public caseload!: Table<Offender, number>;
  public otherOffenders!: Table<Offender, number>;
  public locations!: Table<Select2Model, number>;
  public contactTypes!: Table<Select2Model, number>;
  public contactSummaries!: Table<ContactSummary, number>;

  constructor(private http: HttpClient) {
    super('supervisionContactsDB');
    this.version(1).stores({
      contacts:
        '&contactId, offenderNumber, primaryInterviewer, secondaryInterviewer, contactDate, contactType, contactTypeDesc, location, locationDesc, commentary, formCompleted, previouslySuccessful',
      existingContacts:
        '&contactId, offenderNumber, primaryInterviewer, secondaryInterviewer, contactDate, contactType, contactTypeDesc, location, locationDesc, commentary, formCompleted, previouslySuccessful',
      contactsQueue: 'url, method, body',
      users:
        '&userId, firstName, lastName, fullName, emailAddress,  supervisorId, loggedInUser',
      agents:
        '&userId, firstName, lastName, name, emailAddress, image, phone, supervisorId, primaryUser',
      allOffenders: '&offenderNumber, firstName, lastName, birthDate',
      caseload:
        '&offenderNumber, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate, nextScheduledContactDate, legalStatus',
      otherOffenders:
        '&offenderNumber, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate, nextScheduledContactDate, legalStatus',
      locations: '&id, text',
      contactTypes: '&id, text',
      contactSummaries: '&contactId, summary',
    });

  }
}

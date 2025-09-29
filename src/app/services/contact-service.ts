import {inject, Injectable, Signal} from '@angular/core';
import {Select2String} from '../models/select2-string';
import {Db} from './db';
import {Contact} from '../models/contact';
import {QueuedContact} from '../models/queued-contact';
import {OffenderBase} from '../models/offender-base';
import {Offender} from '../models/offender';
import {LatestSuccessfulContact} from '../models/latest-successful-contact';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';
import {ContactRecordForBff} from '../models/contact-record-for-bff';
import {ApiService} from './api-service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  db:Db = inject(Db);
  apiService:ApiService = inject(ApiService);

  path = '/field_contact_bff/api';
  contactRecordForBff: ContactRecordForBff = {} as ContactRecordForBff;

  queuedContacts: Signal<Array<QueuedContact> | undefined> = toSignal(from(
    liveQuery(async () => this.db.contactsQueue.toArray()))
  );

  constructor() {

  }

  async getInterviewerOptions(): Promise<Select2String[]> {
    const options: Select2String[] = [];
    const agentList = await this.getAgentList();
    agentList.forEach((agent) => {
      if (!agent.name || agent.name.trim() !== '') {
        options.push({id: agent.userId, text: agent.name});
      }
    });
    return options;
  }

  async getAgentList() {
    return this.db.agents.toArray();
  }

  async getListOfContactTypes() {
    return this.db.contactTypes.toArray();
  }

  async getListOfLocations() {
    return this.db.locations.toArray();
  }

  async getLocationDescById(id: number) {
    const location = await this.db.locations.get(Number(id));
    return location?.text || '';
  }
  async getContactTypeDescById(id: number) {
    const contactType = await this.db.contactTypes.get(Number(id));
    return contactType?.text || '';
  }

  async addContactToIdb(contact: Contact) {
    try {
          this.db.contacts.add(contact);
          return contact;
    } catch (error) {
      console.error('Error inserting data:', error);
      throw error;
    }
  }

  syncContactWithDatabase(contact: Contact) {
    this.contactRecordForBff.contactDate = contact.contactDate.toDateString();
    this.contactRecordForBff.offenderNumber = contact.offenderNumber;
    this.contactRecordForBff.contactTypeId = contact.contactTypeId;
    this.contactRecordForBff.locationId = contact.locationId;
    this.contactRecordForBff.primaryInterviewer = contact.primaryInterviewer;
    this.contactRecordForBff.secondaryInterviewer = contact.secondaryInterviewer;
    this.contactRecordForBff.summary = contact.summary;
    this.contactRecordForBff.contactTime = contact.contactTimeString;
    this.contactRecordForBff.result = contact.result;
    this.contactRecordForBff.userAgent = contact.userAgent;


    try {
      if (contact.formCompleted) {
        this.apiService.protectedFetch(this.path + '/offenders/' + contact.offenderNumber + '/contact',
          {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.contactRecordForBff)
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data: number) => {
            this.db.contacts.delete(contact.contactId)
            contact.contactId = data;
            this.db.existingContacts.add(contact);
            return data;
          });
      }
    } catch (error) {
      console.error('Error in syncContactWithDatabase:', error);
    }
  }
  async addPostContactToQueue(contact: Contact) {
    const queueLength = await this.db.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: contact.contactId,
      method: 'POST',
      url: this.path + '/addContact',
      body: contact,
    };
    queuedContact.id = queueLength + 1;
    await this.db.contactsQueue.add(queuedContact);
  }

  async addUpdateContactToQueue(contact: Contact) {
    const queueLength = await this.db.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: queueLength + 1,
      method: 'PUT',
      url: 'http://localhost:3000/updateContact',
      body: contact,
    };
    await this.db.contactsQueue.add(queuedContact);
  }

  async addDeleteContactToQueue(contact: Contact) {
    const queueLength = await this.db.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: queueLength + 1,
      method: 'DELETE',
      url: 'http://localhost:3000/deleteContact',
      body: contact,
    };
    await this.db.contactsQueue.add(queuedContact);
  }

  async addOffenderToOtherOffenders(offender: OffenderBase | null) {
    const newOffender: Offender = {
      ...(offender == null ? ({} as OffenderBase) : offender),
      image: new Blob(),
      offenderAddress: {
        offenderNumber: offender?.offenderNumber ?? 0,
        lineOne: '',
        lineTwo: '',
        city: '',
        state: '',
        zipCode: '',
      },
      defaultPhoneNumber: '',
      agentId: '',
      birthDate: new Date(),
      defaultDob: '',
      defaultOffenderName: {
        firstName: offender?.defaultOffenderName.firstName ?? '',
        lastName: offender?.defaultOffenderName.lastName ?? '',
      },
      lastSuccessfulContactDate: new Date(),
      contactArray: [],
      nextScheduledContactDate: new Date(),
      legalStatus: '',
      lastSuccessfulContact: {} as LatestSuccessfulContact,
    };
    await this.db.otherOffenders.add(newOffender);
  }
  async removeOffenderFromOtherOffenders(offender: OffenderBase) {
    await this.db.otherOffenders.delete(offender.offenderNumber);
  }

  async removeContactFromContacts(contactId: number) {
    await this.db.contacts.delete(contactId);
  }
  async updateContact(contact: Contact) {
    await this.db.contacts.put(contact);
  }
  async getContactById(id: number) {
    const contact = await this.db.contacts.get(id);
    if (!contact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    const contactTypeText = await this.getContactTypeDescById(
      contact.contactTypeId
    );
    console.log('Contact Type line 155:', contactTypeText);
    contact.location = contactTypeText || 'N/A';
    const locationText = await this.getLocationDescById(contact.locationId);
    console.log('Location line 157:', locationText);
    contact.location = locationText || 'N/A';
    return contact;
  }
  async getContactCount() {
    return this.db.contacts.count();
  }
  getAllContacts() {
    return this.db.contacts.toArray();
  }

  async getAllQueuedContacts() {
    return this.db.contactsQueue.toArray();
  }

  async getAllContactsByAgentId(id: string) {
    return this.db.contacts.where('agentId').equals(id).toArray();
  }

  async getCaseloadOffenderById(id: number) {
    return this.db.caseload.get(id);
  }
  async getOtherOffendersOffenderById(id: number) {
    return this.db.otherOffenders.get(id);
  }

  async getUncompletedContactByOffenderNumber(id: number) {
    let contactList = await this.db.contacts
      .where('offenderNumber')
      .equals(id)
      .and((x) => x.formCompleted === false)
      .toArray();
    return contactList[0];
  }

}

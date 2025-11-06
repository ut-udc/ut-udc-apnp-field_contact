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

  async syncContactWithDatabase(contact: Contact): Promise<Response | null> {

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

    if (!contact.formCompleted) return null;

    try {
      const response = await this.apiService.protectedFetch(
        `${this.path}/offenders/${contact.offenderNumber}/contact`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.contactRecordForBff)
        }
      );

      // Only throw for network-level errors (optional)
      if (!response) {
        throw new Error('No response from server');
      }

      // Parse JSON only if status is OK
      if (response.ok) {
        const data: number = await response.json();
        await this.db.contacts.delete(contact.contactId);
        contact.contactId = data;
        await this.db.existingContacts.add(contact);
      }

      // Always return response, even if response.ok === false (e.g., 500)
      return response;

    } catch (error:any) {
      if(error!.message == "Internal Server Error – please try later.") {
        return new Response(JSON.stringify({ message: error.message }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      console.error('Network error in syncContactWithDatabase:', error);
      return null; // Only for true network failures, not HTTP errors
    }
  }

  async addPostContactToQueue(contact: Contact) {
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

    const queueLength = await this.db.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: contact.contactId,
      method: 'PUT',
      url: this.path + '/addContact',
      body: this.contactRecordForBff,
    };

    queuedContact.id = queueLength + 1;
    await this.db.contactsQueue.add(queuedContact);
  }

  // async addUpdateContactToQueue(contact: Contact) {
  //   const queueLength = await this.db.contactsQueue.count();
  //   const queuedContact: QueuedContact = {
  //     id: queueLength + 1,
  //     method: 'PUT',
  //     //TODO Update this with a write API URI to send the JSON body
  //     url: 'http://localhost:3000/updateContact',
  //     body: contact,
  //   };
  //   await this.db.contactsQueue.add(queuedContact);
  // }
  //
  // async addDeleteContactToQueue(contact: Contact) {
  //   const queueLength = await this.db.contactsQueue.count();
  //   const queuedContact: QueuedContact = {
  //     id: queueLength + 1,
  //     method: 'DELETE',
  //     url: 'http://localhost:3000/deleteContact',
  //     body: contact,
  //   };
  //   await this.db.contactsQueue.add(queuedContact);
  // }

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

import {inject, Injectable} from '@angular/core';
import {Select2String} from '../models/select2-string';
import {Db} from './db';
import {Contact} from '../models/contact';
import {QueuedContact} from '../models/queued-contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  db:Db = inject(Db);
  path = '/field_contact_bff/api';

  async getInterviewerOptions(): Promise<Select2String[]> {
    const options: Select2String[] = [];
    const agentList = await this.getAgentList();
    agentList.forEach((agent) => {
      if (!agent.name) {
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

  async addContact(contact: Contact) {
    try {
      contact.userAgent = navigator.userAgent;
      await fetch(this.path + '/addContact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: Contact) => {
          this.db.contacts.add(data);
          return data;
        });
    } catch (error) {
      console.error('Error inserting data:', error);
      throw error;
    }
  }
  syncContactWithDatabase(contact: Contact) {
    try {
      fetch(this.path + '/addContact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
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
    contact.contactTypeDesc = contactTypeText || 'N/A';
    const locationText = await this.getLocationDescById(contact.locationId);
    console.log('Location line 157:', locationText);
    contact.locationDesc = locationText || 'N/A';
    return contact;
  }
  async getContactCount() {
    return this.db.contacts.count();
  }
  getAllContacts() {
    return this.db.contacts.toArray();
  }
  async getAllContactsByOffenderNumberDesc(offenderNumber: number) {
    return this.db.contacts
      .where('offenderNumber')
      .equals(offenderNumber)
      .and((contact) => contact.formCompleted === true)
      .reverse()
      .toArray();
  }

  async getExistingContacts(offenderNumber: number) {
    return this.db.existingContacts
      .where('offenderNumber')
      .equals(offenderNumber)
      .reverse()
      .toArray();
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

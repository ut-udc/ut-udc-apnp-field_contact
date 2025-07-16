import { Injectable } from '@angular/core';
import { Contact } from '../model/Contact';
import { Dexie } from 'dexie';

@Injectable({
  providedIn: 'root',
})
export class ContactData extends Dexie {
  public contacts!: Dexie.Table<Contact, number>;


  constructor() {
    super('ContactData');
    this.version(1).stores({
      contacts:
        'contactId, ofndrNum, agentId, secondaryAgentId, contactDate, contactType, location, commentary, formCompleted, previouslySuccessful',
    });
    this.contacts = this.table('contacts');
  }
  
  async addContact(contact: Contact) {
    await this.contacts.add(contact);
  }
  async removeContact(contact: Contact) {
    await this.contacts.delete(contact.contactId);
  }
  async updateContact(contact: Contact) {
    await this.contacts.put(contact);
  }
  async getContactById(id: number) {
    return await this.contacts.get(id);
  }
  async getContactCount() {
    return await this.contacts.count();
  }
  getAllContacts() {
    return this.contacts.toArray();
  }
  async getAllContactsByOffenderNumber(id: number) {
    return await this.contacts.where('ofndrNum').equals(id).toArray();
  }
  async getAllContactsByAgentId(id: string) {
    return await this.contacts.where('agentId').equals(id).toArray();
  }
  async getAllContactsBySecondaryAgentId(id: string) {
    return await this.contacts.where('secondaryAgentId').equals(id).toArray();
  }
  async getAllContactsByDate(date: Date) {
    return await this.contacts.where('contactDate').equals(date).toArray();
  }
  async getAllContactsByContactType(contactType: string) {
    return await this.contacts.where('contactType').equals(contactType).toArray();
  }
  async getAllContactsByLocation(location: string) {
    return await this.contacts.where('location').equals(location).toArray();
  }
  async getUncompletedContactByOffenderNumber(id: number) {
    let contactList = await this.contacts
      .where('ofndrNum')
      .equals(id)
      .and((x) => x.formCompleted === false)
      .toArray();
    return contactList[0];
  }
}

import { Injectable } from '@angular/core';
import { Contact } from '../model/Contact';

@Injectable({
  providedIn: 'root',
})
export class ContactData {
  protected contactArray: Contact[] = [];

  getContactArray(): Contact[] {
    return this.contactArray;
  }
  addContact(contact: Contact): void {
    this.contactArray.push(contact);
  }
  removeContact(contact: Contact): void {
    this.contactArray = this.contactArray.filter(
      (x) => x.contactId !== contact.contactId
    );
  }
  updateContact(id: number, contact: Contact): void {
    this.contactArray = this.contactArray.map((x) =>
      x.contactId === id ? contact : x
    );
  }
  getContactById(id: number): Contact | undefined {
    return this.contactArray.find((x) => x.contactId === id);
  }
  getContactCount(): number {
    return this.contactArray.length;
  }
  getContactByOffenderId(id: number): Contact[] {
    return this.contactArray.filter((x) => x.ofndrNum === id);
  }
  getContactByAgentId(id: string): Contact[] {
    return this.contactArray.filter((x) => x.agentId === id);
  }
  getContactBySecondaryAgentId(id: string): Contact[] {
    return this.contactArray.filter((x) => x.secondaryAgentId === id);
  }
  getContactByDate(date: Date): Contact[] {
    return this.contactArray.filter((x) => x.contactDate === date);
  }
  getContactByContactType(contactType: string): Contact[] {
    return this.contactArray.filter((x) => x.contactType === contactType);
  }
  getContactByLocation(location: string): Contact[] {
    return this.contactArray.filter((x) => x.location === location);
  }

  constructor() {}
}

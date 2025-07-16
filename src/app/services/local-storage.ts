import { Injectable } from '@angular/core';
import { Contact } from '../model/Contact';

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {
  contactList: Contact[] = [];
  
  constructor() {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('contactForm');
    }

   }

   addContact(contact: Contact) {
    this.contactList.push(contact);
    localStorage.setItem('contactForm', JSON.stringify(this.contactList));
  }
  removeContact(contact: Contact) {
    this.contactList = this.contactList.filter((x) => x.contactId !== contact.contactId);
    localStorage.setItem('contactForm', JSON.stringify(this.contactList));
  }
  updateContact(id: number, contact: Contact) {
    this.contactList = this.contactList.map((x) =>
      x.contactId === id ? contact : x
    );
    localStorage.setItem('contactForm', JSON.stringify(this.contactList));
  }
  getAllContacts() {
    return this.contactList;
  }
}

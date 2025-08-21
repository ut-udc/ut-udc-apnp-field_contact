import { inject, Injectable } from '@angular/core';
import { Contact } from '../model/Contact';
import Dexie, { Table } from 'dexie';
import { Agent } from '../model/Agent';
import { Offender } from '../model/Offender';
import { MyCaseload } from '../components/my-caseload/my-caseload';
import { OffenderBase } from '../model/OffenderBase';
import { Dao } from './dao';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NetworkService } from './network';
import { Select2Model } from '../model/Select2Model';
import { Select2String } from '../model/Select2String';
import { QueuedContact } from '../model/QueuedContact';

@Injectable({
  providedIn: 'root',
})
export class ContactData extends Dexie {
  networkService: NetworkService = inject(NetworkService);
  private path = environment.apiUrl;

  dao: Dao = inject(Dao);
  public contacts!: Table<Contact, number>;
  public contactsQueue!: Table<QueuedContact, number>;
  public agents!: Table<Agent, string>;
  public officers!: Table<Agent, string>;
  public allOffenders!: Table<OffenderBase, number>;
  public myCaseload!: Table<Offender, number>;
  public otherOffenders!: Table<Offender, number>;
  public locationList!: Table<Select2Model, number>;
  public contactTypeList!: Table<Select2Model, number>;
  public applicationUserName: string = 'jshardlow';

  constructor(private http: HttpClient) {
    super('contactDatabase');
    this.version(3).stores({
      contacts:
        'contactId, ofndrNum, agentId, secondaryAgentId, contactDate, contactType, contactTypeDesc, location, locationDesc, commentary, formCompleted, previouslySuccessful',
      contactsQueue: 'url, method, body',
      agents:
        'agentId, firstName, lastName, fullName, email, image, address, city, state, zip, supervisorId',
      officers:
        'agentId, firstName, lastName, fullName, email, image, address, city, state, zip, supervisorId',
      allOffenders: 'ofndrNum, firstName, lastName, birthDate',
      myCaseload:
        'ofndrNum, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate',
      otherOffenders:
        'ofndrNum, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate',
      locationList: 'id, text',
      contactTypeList: 'id, text',
    });
    this.contacts = this.table('contacts');
    this.contactsQueue = this.table('contactsQueue');
    this.agents = this.table('agents');
    this.allOffenders = this.table('allOffenders');
    this.myCaseload = this.table('myCaseload');
    this.otherOffenders = this.table('otherOffenders');
  }

  isOnline(): boolean {
    let online = false;
    this.networkService.onlineStatus$
      .subscribe((status) => (online = status))
      .unsubscribe();
    return online;
  }

  getMyCaseload1(agentId: string): Observable<Offender[]> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<Offender[]>(this.path + '/agentId=' + agentId, {
      headers: header,
      withCredentials: true,
    });
  }

  addContact1(contact: Contact): Observable<Contact> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.post<Contact>(this.path + '/contact', contact, {
      headers: header,
      withCredentials: true,
    });
  }

  async addContact(contact: Contact) {
    try {
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
          this.contacts.add(data);
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
        .then((data: Contact) => {
          this.contacts.add(data);
          return data;
        });
    } catch (error) {
      console.error('Error in syncContactWithDatabase:', error);
    }
  }
  async addPostContactToQueue(contact: Contact) {
    const queueLength = await this.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: contact.contactId,
      method: 'POST',
      url: this.path + '/addContact',
      body: contact,
    };
    queuedContact.id = queueLength + 1;
    await this.contactsQueue.add(queuedContact);
  }

  async addUpdateContactToQueue(contact: Contact) {
    const queueLength = await this.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: queueLength + 1,
      method: 'PUT',
      url: 'http://localhost:3000/updateContact',
      body: contact,
    };
    await this.contactsQueue.add(queuedContact);
  }

  async addDeleteContactToQueue(contact: Contact) {
    const queueLength = await this.contactsQueue.count();
    const queuedContact: QueuedContact = {
      id: queueLength + 1,
      method: 'DELETE',
      url: 'http://localhost:3000/deleteContact',
      body: contact,
    };
    await this.contactsQueue.add(queuedContact);
  }

  async removeContactFromContacts(contactId: number) {
    await this.contacts.delete(contactId);
  }
  async updateContact(contact: Contact) {
    await this.contacts.put(contact);
  }
  async getContactById(id: number) {
    const contact = await this.contacts.get(id);
    if (!contact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    const contactTypeText = await this.getContactTypeDescById(
      contact.contactType
    );
    console.log('Contact Type line 155:', contactTypeText);
    contact.contactTypeDesc = contactTypeText || 'N/A';
    const locationText = await this.getLocationDescById(contact.location);
    console.log('Location line 157:', locationText);
    contact.locationDesc = locationText || 'N/A';
    return contact;
  }
  async getContactCount() {
    return await this.contacts.count();
  }
  getAllContacts() {
    return this.contacts.toArray();
  }
  async getAllContactsByOffenderNumberDesc(id: number) {
    return await this.contacts
      .where('ofndrNum')
      .equals(id)
      .and((contact) => contact.formCompleted === true)
      .reverse()
      .toArray();
  }
  async getAllQueuedContacts() {
    return await this.contactsQueue.toArray();
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
    return await this.contacts
      .where('contactType')
      .equals(contactType)
      .toArray();
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
  async getAgent() {
    return await this.agents.get(this.dao.agent.agentId);
  }
  async getAgentById(id: string): Promise<Agent> {
    const agent = await this.agents.get(id);
    if (!agent) {
      return {} as Agent;
    }
    return agent;
  }
  async getAgentList() {
    return await this.agents.toArray();
  }
  async getInterviewerOptions(): Promise<Select2String[]> {
    const options: Select2String[] = [];
    const agentList = await this.getOfficerList();
    agentList.forEach((agent) => {
      options.push({ id: agent.agentId, text: agent.fullName });
    });
    return options;
  }
  async populateAgent() {
    await this.agents.clear();
    await this.agents.add(this.dao.agent);
  }
  async populateOfficers() {
    await this.officers.clear();
    await this.officers.bulkAdd(this.dao.officerList);
  }
  async getOfficerList(): Promise<Agent[]> {
    return await this.officers.toArray();
  }
  async getOfficerById(id: string): Promise<Agent> {
    const officer = await this.officers.get(id);
    if (!officer) {
      return {} as Agent;
    }
    return officer;
  }

  async populateMyCaseload() {
    await this.myCaseload.clear();
    await this.myCaseload.bulkAdd(this.dao.myCaseload);
  }
  async getMyCaseload(): Promise<Offender[]> {
    return await this.myCaseload.toArray();
  }
  async populateOtherOffenders() {
    await this.otherOffenders.clear();
    await this.otherOffenders.bulkAdd(this.dao.otherOffenders);
  }
  async getOtherOffenders(): Promise<Offender[]> {
    return await this.otherOffenders.toArray();
  }
  async populateAllOffenders() {
    await this.allOffenders.clear();
    await this.allOffenders.bulkAdd(this.dao.allOtherOffenders);
  }
  async getAllOffenders() {
    return await this.allOffenders.toArray();
  }
  async getOffenderById(id: number) {
    return await this.allOffenders.get(id);
  }
  async getCaseloadOffenderById(id: number) {
    return await this.myCaseload.get(id);
  }
  async getOtherOffendersOffenderById(id: number) {
    return await this.otherOffenders.get(id);
  }
  async populateLocations() {
    await this.locationList.clear();
    await this.locationList.bulkAdd(this.dao.locationList);
  }
  async populateContactTypes() {
    await this.contactTypeList.clear();
    await this.contactTypeList.bulkAdd(this.dao.contactTypeList);
  }
  async getListOfLocations() {
    return await this.locationList.toArray();
  }
  async getListOfContactTypes() {
    return await this.contactTypeList.toArray();
  }
  async getLocationById(id: string) {
    return await this.locationList.get(Number(id));
  }
  async getLocationDescById(id: string) {
    console.log('Location line 259:', id);
    const location = await this.locationList.get(Number(id));
    console.log('Location line 261:', location);
    return location?.text || '';
  }
  async getContactTypeById(id: string) {
    return await this.contactTypeList.get(Number(id));
  }
  async getContactTypeDescById(id: string) {
    console.log('Contact Type line 267:', id);
    const contactType = await this.contactTypeList.get(Number(id));
    console.log('Contact Type line 269:', contactType);
    return contactType?.text || '';
  }
  deleteDatabase(): void {
    this.delete();
  }
  async addOffenderToOtherOffenders(offender: OffenderBase | null) {
    const newOffender: Offender = {
      ...(offender == null ? ({} as OffenderBase) : offender),
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      lastSuccessfulContactDate: new Date(),
      contactArray: [],
    };
    await this.otherOffenders.add(newOffender);
  }
  async removeOffenderFromOtherOffenders(offender: OffenderBase) {
    await this.otherOffenders.delete(offender.ofndrNum);
  }
}

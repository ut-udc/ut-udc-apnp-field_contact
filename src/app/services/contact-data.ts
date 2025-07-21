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

@Injectable({
  providedIn: 'root',
})
export class ContactData extends Dexie {
  private path = environment.apiUrl;

  dao: Dao = inject(Dao);
  public contacts!: Table<Contact, number>;
  public agents!: Table<Agent, string>;
  public allOffenders!: Table<OffenderBase, number>;
  public myCaseload!: Table<Offender, number>;
  public otherOffenders!: Table<Offender, number>;

  constructor(private http: HttpClient) {
    super('contactDatabase');
    this.version(1).stores({
      contacts:
        'contactId, ofndrNum, agentId, secondaryAgentId, contactDate, contactType, location, commentary, formCompleted, previouslySuccessful',
      agents:
        'agentId, firstName, lastName, fullName, email, image, address, city, state, zip, supervisorId',
      allOffenders: 'ofndrNum, firstName, lastName, birthDate',
      myCaseload:
        'ofndrNum, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate',
      otherOffenders:
        'ofndrNum, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate',
    });
    this.contacts = this.table('contacts');
    this.agents = this.table('agents');
    this.allOffenders = this.table('allOffenders');
    this.myCaseload = this.table('myCaseload');
    this.otherOffenders = this.table('otherOffenders');
  }

  getMyCaseload1(agentId: string): Observable<Offender[]> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<Offender[]>(this.path + '/agentId=' + agentId, { headers: header, withCredentials: true });
  }

  addContact1(contact: Contact): Observable<Contact> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.post<Contact>(this.path + '/contact', contact, { headers: header, withCredentials: true });
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
  async getAllContactsByOffenderNumberDesc(id: number) {
    return await this.contacts.where('ofndrNum').equals(id).reverse().toArray();
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
  async getAgentById(id: string, source: string) {
    const agent = await this.agents.get(id);
    console.log('Agend from contact-data line91:', source + ' ', agent);
    return agent;
  }
  async getAgentInitials(id:string, source:string): Promise<string> {
    const agent = await this.agents.get(id);
    console.log('Agent from contactData line 96 getInitials:', source + ' ', agent);
    if (!agent) {
      throw new Error('Agent not found navigation.ts line 55');
    }
    return agent.firstName.substring(0, 1) + agent.lastName.substring(0, 1);
  }
  async populateAgent() {
    await this.agents.clear();
    await this.agents.add(this.dao.agent);
  }
  async populateMyCaseload() {
    await this.myCaseload.clear();
    await this.myCaseload.bulkAdd(this.dao.myCaseload);
  }
  async getMyCaseload() {
    return await this.myCaseload.toArray();
  }
  async populateOtherOffenders() {
    await this.otherOffenders.clear();
    await this.otherOffenders.bulkAdd(this.dao.otherOffenders);
  }
  async getOtherOffenders() {
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
}

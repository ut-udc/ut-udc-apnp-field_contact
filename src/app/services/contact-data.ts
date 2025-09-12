import { inject, Injectable, OnInit } from '@angular/core';
import { Contact } from '../model/Contact';
import Dexie, { Table } from 'dexie';
import { Agent } from '../model/Agent';
import { Offender } from '../model/Offender';
import { MyCaseload } from '../components/my-caseload/my-caseload';
import { OffenderBase } from '../model/OffenderBase';
import { Dao } from './dao';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NetworkService } from './network';
import { Subscription } from 'rxjs';
import { Select2Model } from '../model/Select2Model';
import { Select2String } from '../model/Select2String';
import { QueuedContact } from '../model/QueuedContact';
import { ApiResponse } from '../model/ApiResponse';
import { Photo } from '../model/Photo';
import { LegalStatus } from '../model/LegalStatus';
import { LatestSuccessfulContact } from '../model/LatestSuccessfulContact';

@Injectable({
  providedIn: 'root',
})
export class ContactData extends Dexie implements OnInit {
  isOnline: boolean = true;
  ngOnInit(): void {
    this.networkSubscription = this.networkService.onlineStatus$.subscribe(
      (status) => {
        this.isOnline = status;
      }
    );
  }
  networkService: NetworkService = inject(NetworkService);
  private path = environment.apiUrl;

  dao: Dao = inject(Dao);
  public contacts!: Table<Contact, number>;
  public existingContacts!: Table<Contact, number>;
  public contactsQueue!: Table<QueuedContact, number>;
  public agents!: Table<Agent, string>;
  public officers!: Table<Agent, string>;
  public allOffenders!: Table<OffenderBase, number>;
  public myCaseload!: Table<Offender, number>;
  public otherOffenders!: Table<Offender, number>;
  public locationList!: Table<Select2Model, number>;
  public contactTypeList!: Table<Select2Model, number>;
  public applicationUserName: string = 'abadger';
  public photos!: Table<Photo, number>;
  private networkSubscription!: Subscription;

  constructor(private http: HttpClient) {
    super('contactDatabase');
    this.version(5).stores({
      contacts:
        'contactId, offenderNumber, agentId, secondaryAgentId, contactDate, contactType, contactTypeDesc, location, locationDesc, commentary, formCompleted, previouslySuccessful',
      existingContacts:
        'contactId, offenderNumber, agentId, secondaryAgentId, contactDate, contactType, contactTypeDesc, location, locationDesc, commentary, formCompleted, previouslySuccessful',
      contactsQueue: 'url, method, body',
      agents:
        'agentId, firstName, lastName, fullName, email, image, address, city, state, zip, supervisorId, loggedInAgent, agentImpersonated, primaryUser',
      officers:
        'agentId, firstName, lastName, fullName, email, image, address, city, state, zip, supervisorId',
      allOffenders: 'offenderNumber, firstName, lastName, birthDate',
      myCaseload:
        'offenderNumber, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate, nextScheduledContactDate, legalStatus',
      otherOffenders:
        'offenderNumber, firstName, lastName, birthDate, image, address, city, state, zip, phone, lastSuccessfulContactDate, nextScheduledContactDate, legalStatus',
      locationList: 'id, text',
      contactTypeList: 'id, text',
      photos: 'offenderNumber, photo',
    });
    this.contacts = this.table('contacts');
    this.existingContacts = this.table('existingContacts');
    this.contactsQueue = this.table('contactsQueue');
    this.agents = this.table('agents');
    this.allOffenders = this.table('allOffenders');
    this.myCaseload = this.table('myCaseload');
    this.otherOffenders = this.table('otherOffenders');
    this.photos = this.table('photos');
  }

  isOnlineNow(): boolean {
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

  async getAgentToImpersonate() {
    return await this.agents.get(this.applicationUserName);
  }

  getUser(): Observable<Agent> {
    return this.http.get<Agent>(this.path + '/user');
  }

  async fetchAgentToImpersonate(agentId: string) {
    let url = this.path + '/agentEmail=' + agentId;
    const agent = await this.fetchData<Agent>(url);
    return agent.data;
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
    return await this.contacts.count();
  }
  getAllContacts() {
    return this.contacts.toArray();
  }
  async getAllContactsByOffenderNumberDesc(offenderNumber: number) {
    return await this.contacts
      .where('offenderNumber')
      .equals(offenderNumber)
      .and((contact) => contact.formCompleted === true)
      .reverse()
      .toArray();
  }

  async getExistingContacts(offenderNumber: number) {
    return await this.existingContacts
      .where('offenderNumber')
      .equals(offenderNumber)
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
  async getAllContactsByContactType(contactTypeCd: string) {
    return await this.contacts
      .where('contactTypeCd')
      .equals(contactTypeCd)
      .toArray();
  }
  async getAllContactsByLocation(locationCd: string) {
    return await this.contacts.where('locationCd').equals(locationCd).toArray();
  }
  async getUncompletedContactByOffenderNumber(id: number) {
    let contactList = await this.contacts
      .where('offenderNumber')
      .equals(id)
      .and((x) => x.formCompleted === false)
      .toArray();
    return contactList[0];
  }
  async getAgent() {
    return await this.agents.get(this.applicationUserName);
  }
  async getAgentById(id: string): Promise<Agent> {
    console.log('Agent ID line 287:', id);
    const agent = await this.agents.get(id);
    if (!agent) {
      return {} as Agent;
    }
    return agent;
  }
  async getPrimaryUser(): Promise<Agent> {
    return await this.agents.where('primaryUser').equals(1).first() || {} as Agent;
  };
  
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
    // await this.agents.clear();
    this.getUser().subscribe((user) => {
      if (user) {
        this.applicationUserName = user.agentId;
        this.populateOfficers();
        this.populateMyCaseload();
        this.populateOtherOffenders();
        this.populateAllOffenders();
        this.populateLocations();
        this.populateContactTypes();
        user.primaryUser = true;
        this.agents.add(user);
        console.log('User from app line 321:', user);
      }
    });
  }
  async getOfficers() {
    return this.http.get<Agent[]>(this.path + '/officers');
  }

  async populateOfficers() {
    await this.officers.clear();
    // (await this.getOfficers()).subscribe((officers) => {
    //   this.officers.bulkAdd(officers);
    // });
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
    (await this.getMyCaseloadFromAPI()).subscribe((myCaseload) => {
      console.log('My Caseload line 317:', myCaseload);
      try {
        myCaseload.sort((a, b) =>
          b.defaultOffenderName.lastName.localeCompare(
            a.defaultOffenderName.lastName
          )
        );
        this.myCaseload.bulkAdd(myCaseload);
        for (const offender of myCaseload) {
          this.populatePhotos(offender.offenderNumber);
          this.populateLatestSuccessfulContacts(offender.offenderNumber);
          this.populateExistingContacts(offender.offenderNumber);
        }
      } catch (error) {
        console.error('Error bulk adding myCaseload:', error);
      }
    });
  }

  getMyCaseloadFromAPI() {
    return this.http.get<Offender[]>(
      this.path + '/agent-caseload/' + this.applicationUserName
    );
  }
  async getMyCaseload(): Promise<Offender[]> {
    return await this.myCaseload.toArray();
  }
  async populateOtherOffenders() {
    await this.otherOffenders.clear();
    // await this.otherOffenders.bulkAdd(this.dao.otherOffenders);
  }
  async getOtherOffenders(): Promise<Offender[]> {
    return await this.otherOffenders.toArray();
  }
  async populateAllOffenders() {
    await this.allOffenders.clear();
    // (await this.getAllOffendersFromAPI()).subscribe((offenders) => {
    //   this.allOffenders.bulkAdd(offenders);
    // });
  }
  async getAllOffendersFromAPI() {
    return this.http.get<OffenderBase[]>(this.path + '/allApnpOffenders');
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
    (await this.getLocations()).subscribe((locations) => {
      this.locationList.bulkAdd(locations);
    });
  }
  async getLocations() {
    return this.http.get<Select2Model[]>(this.path + '/locations');
  }

  async populateContactTypes() {
    await this.contactTypeList.clear();
    (await this.getContactTypes()).subscribe((contactTypes) => {
      this.contactTypeList.bulkAdd(contactTypes);
    });
  }

  async getContactTypes() {
    return this.http.get<Select2Model[]>(this.path + '/contact-types');
  }

  async populateExistingContacts(offenderNumber: number) {
    await this.existingContacts.clear();
    (await this.getAllContactsFromAPI(offenderNumber)).subscribe((contacts) => {
      this.existingContacts.bulkAdd(contacts);
    });
  }

  async getAllContactsFromAPI(offenderNumber: number) {
    return this.http.get<Contact[]>(
      this.path + '/existing-contacts/' + offenderNumber
    );
  }

  async populateLatestSuccessfulContacts(offenderNumber: number) {
    (await this.getLatestOffenderContact(offenderNumber)).subscribe(
      (contact) => {
        this.myCaseload.update(offenderNumber, {
          lastSuccessfulContact: contact,
        });
      }
    );
  }

  async getLatestOffenderContact(offenderNumber: number) {
    return this.http.get<LatestSuccessfulContact>(
      this.path + '/latest-successful-contact/' + offenderNumber
    );
  }

  async populatePhotos(offenderNumber: number) {
    await this.photos.clear();
    (await this.getPhoto(offenderNumber)).subscribe((photo) => {
      let photo1: Photo = {
        offenderNumber: offenderNumber,
        image: photo,
      };
      this.photos.add(photo1);
    });
  }

  async getPhoto(offenderNumber: number) {
    return this.http.get(this.path + '/offender-photo/' + offenderNumber, {
      responseType: 'blob',
    });
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
  async getLocationDescById(id: number) {
    const location = await this.locationList.get(Number(id));
    return location?.text || '';
  }
  async getContactTypeById(id: number) {
    return await this.contactTypeList.get(Number(id));
  }
  async getContactTypeDescById(id: number) {
    const contactType = await this.contactTypeList.get(Number(id));
    return contactType?.text || '';
  }
  deleteDatabase(): void {
    this.delete();
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
      phone: '',
      lastSuccessfulContactDate: new Date(),
      contactArray: [],
      nextScheduledContactDate: new Date(),
      legalStatus: '',
      lastSuccessfulContact: {} as LatestSuccessfulContact,
    };
    await this.otherOffenders.add(newOffender);
  }
  async removeOffenderFromOtherOffenders(offender: OffenderBase) {
    await this.otherOffenders.delete(offender.offenderNumber);
  }

  //generic GET call method for getting everything we need from the APIs
  async fetchData<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Handle HTTP errors (e.g., 404, 500)
        const errorText = await response.text();
        return {
          data: null,
          error: `HTTP Error: ${response.status} - ${errorText}`,
        };
      }

      const data: T = await response.json();
      return { data, error: null };
    } catch (error) {
      // Handle network errors or other exceptions
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
      return { data: null, error: 'An unknown error occurred' };
    }
  }
}

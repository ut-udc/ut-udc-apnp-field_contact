import {inject, Injectable, signal} from '@angular/core';
import {Agent} from '../models/agent';
import {Db} from './db';
import {User} from '../models/user';
import {Select2Model} from '../models/select2-model';

@Injectable({
  providedIn: 'root'
})
export class LoadDataService {
  db: Db = inject(Db)
  baseUrl: string = '/field_contact_bff/api';
  dbReady = signal(false);
  errorInfo = signal({});
  dataInitComplete = signal(false);
  constructor() {
    // Start async init but don’t block constructor
    this.initializeData();
  }
  /** Initialize database and load all base data safely */
  async initializeData() {
    try {
      await this.db.open();
      console.log('Dexie DB opened');

      // Mark DB as ready
      this.dbReady.set(true);

      // Fetch data concurrently
      const [user, agents, locations, contactTypes] = await Promise.all([
        this.fetchData<User>(`${this.baseUrl}/user`),
        this.fetchData<Array<Agent>>(`${this.baseUrl}/agents-with-offenders`),
        this.fetchData<Array<Select2Model>>(`${this.baseUrl}/locations`),
        this.fetchData<Array<Select2Model>>(`${this.baseUrl}/contact-types`),
        this.fetchData<Array<Select2Model>>(`${this.baseUrl}/contact-result-types`)
      ]);

      // Populate data safely
      await this.insertUser(user);
      await this.insertAgents(agents);
      await this.insertLocations(locations);
      await this.insertContactTypes(contactTypes);
      await this.insertContactResultTypes(contactTypes);
      this.dataInitComplete.set(true);
      console.log('All base data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /** Insert user into DB */
  private async insertUser(user: User) {
    if (!user) return;
    user.loggedInUser = 1;
    await this.db.users.clear(); // prevent duplicates
    await this.db.users.add(user);
    console.log('User added');
  }

  /** Insert agents */
  private async insertAgents(agentList: Array<Agent>) {
    if (!agentList?.length) return;
    await this.db.agents.clear();
    for (const agent of agentList) {
      agent.primaryUser = 0;
      agent.userId = agent.userId.trim();
    }
    await this.db.agents.bulkAdd(agentList);
    console.log(`${agentList.length} agents added`);
  }

  /** Insert locations */
  private async insertLocations(locationList: Array<Select2Model>) {
    if (!locationList?.length) return;
    await this.db.locations.clear();
    await this.db.locations.bulkAdd(locationList);
    console.log(`${locationList.length} locations added`);
  }

  /** Insert contact types */
  private async insertContactTypes(contactTypeList: Array<Select2Model>) {
    if (!contactTypeList?.length) return;
    await this.db.contactTypes.clear();
    await this.db.contactTypes.bulkAdd(contactTypeList);
    console.log(`${contactTypeList.length} contact types added`);
  }

  /** Insert contact result types */
  private async insertContactResultTypes(contactResultTypeList: Array<Select2Model>) {
    if (!contactResultTypeList?.length) return;
    await this.db.contactResultTypes.clear();
    await this.db.contactResultTypes.bulkAdd(contactResultTypeList);
    console.log(`${contactResultTypeList.length} contact result types added`);
  }

  /** Generic fetch with type safety */
  async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url} (${response.status})`);
    return response.json();
  }

  /** Example extra method */
  appTitle() {
    return signal('field-contact');
  }
}

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


  constructor() {
    let userPromise: Promise<User> = this.fetchData(this.baseUrl + '/user');

    let agentListPromise: Promise<Array<Agent>> = this.fetchData(this.baseUrl + '/agents-with-offenders');
    let locationListPromise: Promise<Array<Select2Model>> = this.fetchData(this.baseUrl + '/locations');
    let contactTypeListPromise: Promise<Array<Select2Model>> = this.fetchData(this.baseUrl + '/contact-types');
    this.db.on('ready', () => {

      userPromise.then(user => {
        user.loggedInUser = 1;
        this.db.users.add(user);
      });

      agentListPromise.then(agentList => {
        for (let agent of agentList) {
          agent.primaryUser = 0;
          agent.userId = agent.userId.trim();
        }
        this.db.agents.bulkAdd(agentList)
      });

      locationListPromise.then(locationList => {
        this.db.locations.bulkAdd(locationList)
      });

      contactTypeListPromise.then(contactTypeList => {
        this.db.contactTypes.bulkAdd(contactTypeList)
      });

    })
  }

  async loadData(userId: string) {

  }

  async fetchData(url: string) {
    return (await fetch(url)).json();
  }

  appTitle() {
    return signal('field-contact');
  }
}

import {inject, Injectable, Signal, signal} from '@angular/core';
import {Agent} from '../models/agent';
import {Db} from './db';
import {User} from '../models/user';
import {Select2Model} from '../models/select2-model';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class LoadDataService {
  db: Db = inject(Db)

  constructor() {
    let baseUrl: string = '/field_contact_bff/api';
    let userPromise: Promise<User> = this.fetchData(baseUrl + '/user?impersonateId=abadger');

    let agentListPromise: Promise<Array<Agent>> = this.fetchData(baseUrl + '/agents-with-offenders');
    let locationListPromise: Promise<Array<Select2Model>> = this.fetchData(baseUrl + '/locations');
    let contactTypeListPromise: Promise<Array<Select2Model>> = this.fetchData(baseUrl + '/contact-types');
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

  async fetchData(url:string){
    return (await fetch(url)).json();
  }

  appTitle(){
    return signal('field-contact');
  }
}

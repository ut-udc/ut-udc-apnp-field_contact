import {effect, inject, Injectable, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';
import {Db} from './db';
import {Agent} from '../models/agent';
import {UserService} from './user-service';
import {Offender} from '../models/offender';
import {Contact} from '../models/contact';
import {LoadDataService} from './load-data-service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  db: Db = inject(Db);
  userService: UserService = inject(UserService);
  loadDataService: LoadDataService = inject(LoadDataService);

  primaryAgent: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('primaryUser')
      .equals(1)
      .first()))
  );

  allAgents: Signal<Array<Agent> | undefined> = toSignal(from(
    liveQuery(async () => this.db.agents.toArray()))
  );

  myCaseload: Signal<Array<Offender> | undefined> = toSignal(from(
    liveQuery(async ()=> this.db.caseload.toArray()))
  );

  constructor() {

    effect(async () => {
      if (this.allAgents()) {
        this.allAgents()?.filter(a => a.userId == this.userService.user()?.userId)
          .forEach(a => {
            a.primaryUser = 1;
            this.db.agents.put(a);
          });
      }
    })

    effect(async () => {
      console.log(`The currentUser: ${this.primaryAgent()?.userId}`);
      if (this.primaryAgent()) {
        console.log("inside if");
        let response = await fetch('/field_contact_bff/api/agent-caseload/' + this.primaryAgent()?.userId);
        let offenders = await response.json();
        await this.db.caseload.bulkAdd(offenders);
      }
    });

    effect(async () => {
      if (this.myCaseload()) {
        this.myCaseload()?.map(offender => offender.offenderNumber)
          .forEach( offender =>{
              this.loadExistingContacts(offender)
            }
          );
      }
    });
  }

  loadExistingContacts(offenderNumber: number) {
    let existingContactPromise: Promise<Array<Contact>> = this.loadDataService.fetchData(this.loadDataService.baseUrl + '/existing-contacts/' + offenderNumber);
    existingContactPromise.then(existingContacts => {
      for (let i = 0; i < existingContacts.length; i++) {
        existingContacts[i].contactTimeString = existingContacts[i].contactTime.toString();
      }
      this.db.existingContacts.bulkAdd(existingContacts)
    });
  }

}

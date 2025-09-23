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
import {Select2Model} from '../models/select2-model';

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

  allLocations: Signal<Array<Select2Model> | undefined> = toSignal(from(
    liveQuery(async ()=> this.db.locations.toArray()))
  );

  allContactTypes: Signal<Array<Select2Model> | undefined> = toSignal(from(
    liveQuery(async ()=> this.db.contactTypes.toArray()))
  );

  constructor() {

    effect(async () => {
      if (this.allAgents()) {
        let agent: Agent | undefined = this.allAgents()!.find(a => a.userId == this.userService.user()?.userId);
        let update  = { userId: 'abadger', primaryUser: 1 };
        if (agent) {
          update.userId = agent.userId;
        }

        this.db.agents.update(update.userId, update);
      }
    })

    effect(async () => {
      if (this.primaryAgent()) {
        let response = await fetch('/field_contact_bff/api/agent-caseload/' + this.primaryAgent()?.userId);
        let offenders:Array<Offender> = await response.json();
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
        existingContacts[i].summary = 'Which is true. I have been a connoisseur of fast motorcycles all my life. I bought a brand-new 650 BSA Lightning when it was billed as "the fastest motorcycle ever tested by Hot Rod magazine." ' +
          'I have ridden a 500-pound Vincent through traffic on the Ventura Freeway with burning oil on my legs and run the Kawa 750 Triple through Beverly Hills at night with a head full of acid... ' +
          'I have ridden with Sonny Barger and smoked weed in biker bars with Jack Nicholson, Grace Slick, Ron Zigler and my infamous old friend, Ken Kesey, a legendary Cafe Racer.\n' +
          '\n';
        existingContacts[i].primaryInterviewer.userId = existingContacts[i].primaryInterviewer?.userId?.trim();
        if (existingContacts[i].secondaryInterviewer) {
          existingContacts[i].secondaryInterviewer.userId = existingContacts[i].secondaryInterviewer?.userId?.trim();
        }
      }
      this.db.existingContacts.bulkAdd(existingContacts)
    });
  }

}

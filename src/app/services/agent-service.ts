import {effect, inject, Injectable, signal, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';
import {Db} from './db';
import {Agent} from '../models/agent';
import {UserService} from './user-service';
import {Offender} from '../models/offender';
import {Contact} from '../models/contact';
import {Select2Model} from '../models/select2-model';
import {ApiService} from './api-service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  db: Db = inject(Db);
  userService: UserService = inject(UserService);
  apiService:ApiService = inject(ApiService);
  contactIdArray: number[] = [];
  baseUrl: string = '/field_contact_bff/api';

  primaryAgent: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('primaryUser')
      .equals(1)
      .first()))
  );

  proxyUserId = signal('');

  setPrimaryAgentStatus = signal(1)

  updateProxyUser(userId: string) {
    this.proxyUserId.set(userId);
  }

  updatePrimaryAgentStatus(status: number) {
    this.setPrimaryAgentStatus.set(status);
  }

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
        if(!agent){
          agent = this.allAgents()!.find(a => a.userId == this.proxyUserId());
        }
        let update  = { userId: this.proxyUserId(), primaryUser: this.setPrimaryAgentStatus() };
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
      if (this.myCaseload() && await this.db.existingContacts.count() === 0) {
        this.myCaseload()?.map(offender => offender.offenderNumber)
          .forEach( offender =>{
              this.loadExistingContacts(offender)
            }
          );
      }
    });
  }

  loadExistingContacts(offenderNumber: number) {
    let existingContactPromise: Promise<Array<Contact>> = this.fetchData(this.baseUrl + '/existing-contacts/' + offenderNumber);
    existingContactPromise.then(existingContacts => {
      let summaryIds = [];

      for (let i = 0; i < existingContacts.length; i++) {
        this.contactIdArray.push(existingContacts[i].contactId);
        existingContacts[i].contactTimeString = existingContacts[i].contactTime.toString();
        // existingContacts[i].summary = 'Which is true. I have been a connoisseur of fast motorcycles all my life. I bought a brand-new 650 BSA Lightning when it was billed as "the fastest motorcycle ever tested by Hot Rod magazine." ' +
        //   'I have ridden a 500-pound Vincent through traffic on the Ventura Freeway with burning oil on my legs and run the Kawa 750 Triple through Beverly Hills at night with a head full of acid... ' +
        //   'I have ridden with Sonny Barger and smoked weed in biker bars with Jack Nicholson, Grace Slick, Ron Zigler and my infamous old friend, Ken Kesey, a legendary Cafe Racer.\n' +
        //   '\n';
        existingContacts[i].primaryInterviewer.userId = existingContacts[i].primaryInterviewer?.userId?.trim();
        existingContacts[i].contactSyncedWithDatabase = true;
        existingContacts[i].formCompleted = true;
        if (existingContacts[i].secondaryInterviewer) {
          existingContacts[i].secondaryInterviewer.userId = existingContacts[i].secondaryInterviewer?.userId?.trim();
        }

        summaryIds.push(existingContacts[i].contactId);
        // if (summaryIds.length > 10) {
        //   this.loadSummaries(summaryIds);
        //   summaryIds = [];
        // }
      }

      if (summaryIds.length > 0) {
        this.loadSummaries(summaryIds);
      }

      console.log('offender number: ' + offenderNumber + ', summaryIds: ', summaryIds.length);

      this.db.existingContacts.bulkAdd(existingContacts)

    });
  }

  loadSummaries(contactIds: Array<number>) {
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactIds: contactIds
      })
    };

    this.apiService.protectedFetch(`${this.baseUrl}/existing-contact-summaries`, options)
      .then(response => {
        if (response.ok) {
          console.log('protectedFetch existing-contact-summaries response ok');
          return response.json();
        }
        else {
          throw new Error(`Response code ${response.status}`)
        }
      })
      .then((summaries: Array<Contact>) => {
        summaries.forEach((s: Contact) => {
          this.db.existingContacts.update(s.contactId, { summary: s.summary });
        });
      })
      .catch(error => {
        console.error(`Unable to get summaries for ${contactIds}: ${error}`);
      });
  }

  async fetchData(url: string) {
    return (await fetch(url)).json();
  }

}

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
  apiService: ApiService = inject(ApiService);
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
    caches.delete('images');
    this.setPrimaryAgentStatus.set(status);
  }

  // Removed Async in Live Query
  allAgents: Signal<Array<Agent> | undefined> = toSignal(from(
    liveQuery(() => this.db.agents.toArray()))
  );
  // Removed Async in Live Query
  myCaseload: Signal<Array<Offender> | undefined> = toSignal(from(
    liveQuery(() => this.db.caseload.toArray()))
  );
  // Removed Async in Live Query
  allLocations: Signal<Array<Select2Model> | undefined> = toSignal(from(
    liveQuery(() => this.db.locations.toArray()))
  );
  // Removed Async in Live Query
  allContactTypes: Signal<Array<Select2Model> | undefined> = toSignal(from(
    liveQuery(() => this.db.contactTypes.toArray()))
  );
  allContactResultTypes: Signal<Array<Select2Model> | undefined> = toSignal(from(
    liveQuery(() => this.db.contactResultTypes.toArray()))
  );

  constructor() {
    // Effect 1 — Ensure primary agent flag is synced in Dexie
    effect(async () => {
      const agents = this.allAgents();
      if (!agents || agents.length === 0) return;

      const user = this.userService.user();
      if (!user) return;

      let agent: Agent | undefined = agents.find(a => a.userId == user.userId)
        || agents.find(a => a.userId == this.proxyUserId());

      if (!agent) return;

      let update = {userId: agent.userId, primaryUser: this.setPrimaryAgentStatus()};
      // Enclosed in try catch to avoid exceptions
      try {
        await this.db.agents.update(update.userId, update);
      } catch (e) {
        console.error('Agent update failed', e);

      }
    })

    // Effect 2 — Load caseload for the current primary agent
    effect(async () => {
      const agent = this.primaryAgent();
      if (!agent) return;
      try {
        const response = await fetch(`${this.baseUrl}/agent-caseload/${agent.userId}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const offenders: Offender[] = await response.json();
        // clearing old data
        await this.db.caseload.clear();
        // Switched from bulkAdd to bulkPut to safely upsert records and avoid duplicate key errors
        await this.db.caseload.bulkPut(offenders, {allKeys: true});
      } catch (error) {
        console.error('Failed to load agent caseload:', error);
      }
    });

    // Effect 3 — Load existing contacts for each offender
    effect(async () => {
      const caseload = this.myCaseload();
      if (!caseload?.length) return;

      const count = await this.db.existingContacts.count();
      if (count > 0) return;

      for (const offender of caseload) {
        await this.loadExistingContacts(offender.offenderNumber);
      }
    });
  }

  // Handled in async way
  async loadExistingContacts(offenderNumber: number) {
    try {
      const contacts = await this.fetchData<Array<Contact>>(`${this.baseUrl}/existing-contacts/${offenderNumber}`);

      if (!contacts?.length) return;

      const summaryIds: number[] = [];

      for (const c of contacts) {
        c.contactTimeString = c.contactTime?.toString() ?? '';
        c.primaryInterviewer.userId = c.primaryInterviewer?.userId?.trim();
        c.contactSyncedWithDatabase = true;
        c.formCompleted = true;
        if (c.secondaryInterviewer) {
          c.secondaryInterviewer.userId = c.secondaryInterviewer.userId?.trim();
        }

        summaryIds.push(c.contactId);
        this.contactIdArray.push(c.contactId);
      }
      // Switched from bulkAdd to bulkPut to safely upsert records and avoid duplicate key errors
      await this.db.existingContacts.bulkPut(contacts, {allKeys: true});

      if (summaryIds.length) {
        await this.loadSummaries(summaryIds);
      }

      console.log(`Loaded contacts for offender ${offenderNumber}, count: ${contacts.length}`);
    } catch (error) {
      console.error(`Failed to load contacts for offender ${offenderNumber}:`, error);
    }
  }

  // Handled in async way
  async loadSummaries(contactIds: number[]) {
    try {
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({contactIds}),
      };

      const response = await this.apiService.protectedFetch(`${this.baseUrl}/existing-contact-summaries`, options);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const summaries: Contact[] = await response.json();

      for (const s of summaries) {
        await this.db.existingContacts.update(s.contactId, {summary: s.summary});
      }
    } catch (error) {
      console.error(`Unable to get summaries for ${contactIds}:`, error);
    }
  }

  // Handled in async way
  async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  }

}

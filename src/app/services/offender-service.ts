import {inject, Injectable} from '@angular/core';
import {Db} from './db';
import {LoadDataService} from './load-data-service';
import {Contact} from '../models/contact';
import {AgentService} from './agent-service';

@Injectable({
  providedIn: 'root'
})
export class OffenderService {
  db:Db = inject(Db);
  loadDataService: LoadDataService = inject(LoadDataService);
  agentService:AgentService = inject(AgentService);




  constructor() {
    (this.agentService.myCaseload())
      ?.map(offender => offender.offenderNumber)
      .forEach(offender => this.loadExistingContacts(offender));

  }

  loadExistingContacts(offenderNumber:number){
    let existingContactPromise: Promise<Array<Contact>> = this.loadDataService.fetchData(this.loadDataService.baseUrl + '/existing-contacts/' + offenderNumber);
    existingContactPromise.then(existingContacts => {
      this.db.existingContacts.bulkAdd(existingContacts)
    });
  }

}

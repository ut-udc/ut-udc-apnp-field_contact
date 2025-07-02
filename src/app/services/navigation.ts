import { inject, Injectable } from '@angular/core';
import { Offender } from '../model/Offender';
import { Agent } from '../model/Agent';
import { Dao } from './dao';
import { Select2Model } from '../model/Select2Model';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  Dao: Dao = inject(Dao);
  public agent: Agent = this.Dao.agent;
  public officerList: Agent[] = this.Dao.officerList;
  
  getOfficerByAgentId(id: string): Agent | undefined {
    return this.Dao.officerList.find((x) => x.agentId === id);
  }
  getOfficerList(): Agent[] {
    return this.Dao.officerList;
  }
  getListOfOfficers(): Agent[] {
    return this.Dao.officerList;
  }
  contactTypeList: Select2Model[] = this.Dao.contactTypeList;
  locationList: Select2Model[] = this.Dao.locationList;

  getContactTypeById(id: string): Select2Model | undefined {
    return this.Dao.contactTypeList.find((x) => x.id === id);
  }
  getLocationById(id: string): Select2Model | undefined {
    return this.Dao.locationList.find((x) => x.id === id);
  }
  getMyCaseload(): Offender[] {
    return this.Dao.agent.myCaseload;
  }
  getOtherOffenders(): Offender[] {
    return this.Dao.agent.otherOffenders;
  }
  getAgent(): Agent {
    return this.Dao.agent;
  }
  getAgentInitials(): string {
    return (
      this.Dao.agent.firstName.substring(0, 1) + this.Dao.agent.lastName.substring(0, 1)
    );
  }
  getAgentFirstName(): string {
    return this.Dao.agent.firstName;
  }
  getAgentLastName(): string {
    return this.Dao.agent.lastName;
  }
  getMyCaseloadCount(): number {
    return this.Dao.agent.myCaseload.length;
  }
  getOtherOffendersCount(): number {
    return this.Dao.agent.otherOffenders.length;
  }
  getCaseloadOffenderById(id: number): Offender | undefined {
    return this.Dao.agent.myCaseload.find((x) => x.ofndrNum === id);
  }
  getOtherOffendersOffenderById(id: number): Offender | undefined {
    return this.Dao.agent.otherOffenders.find((x) => x.ofndrNum === id);
  }
  addOffenderToMyCaseload(offender: Offender): void {
    this.Dao.agent.myCaseload.push(offender);
  }
  addOffenderToOtherOffenderList(offender: Offender): void {
    this.Dao.agent.otherOffenders.push(offender);
  }
  removeOffenderFromMyCaseload(offender: Offender): void {
    this.Dao.agent.myCaseload = this.Dao.agent.myCaseload.filter(
      (x) => x.ofndrNum !== offender.ofndrNum
    );
  }
  removeOffenderFromOtherOffenders(offender: Offender): void {
    this.Dao.agent.otherOffenders = this.Dao.agent.otherOffenders.filter(
      (x) => x.ofndrNum !== offender.ofndrNum
    );
  }
  constructor() {}
}

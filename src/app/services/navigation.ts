import { inject, Injectable } from '@angular/core';
import { Offender } from '../model/Offender';
import { Agent } from '../model/Agent';
import { Dao } from './dao';
import { Select2Model } from '../model/Select2Model';
import { ContactData } from './contact-data';
import { OffenderBase } from '../model/OffenderBase';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  Dao: Dao = inject(Dao);
  contactData: ContactData = inject(ContactData);
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
  async getMyCaseload(): Promise<Offender[]> {
    await this.contactData.open();
    return await this.contactData.myCaseload.toArray();
  }
  async getOtherOffenders(): Promise<Offender[]> {
    return await this.contactData.otherOffenders.toArray();
  }
  async getAllOffenders(): Promise<OffenderBase[]> {
    return await this.contactData.allOffenders.toArray();
  }
  // async getAgent(): Promise<Agent> {
  //   console.log('Agent ID line 47:', this.Dao.agent.agentId);
  //   const agent = await this.contactData.agents.get(this.Dao.agent.agentId);
  //   console.log('Agents from navigation line 48:', agent);
  //   // const agent = await this.contactData.getAgentById(this.Dao.agent.agentId);
  //   if (!agent) {
  //     //throw new Error('Agent not found navigation.ts line 48');
  //     return new Promise<Agent>((resolve, reject) => {
  //       resolve(this.Dao.agent);
  //     });
  //   }
  //   console.log('Agent from navigation line 48:', agent);
  //   return agent;
  // }
  async getAgentInitials(): Promise<string> {
    const agent = await this.contactData.agents.get(this.Dao.agent.agentId);
    console.log('Agent from navigation line 54 getInitials:', agent);
    if (!agent) {
      throw new Error('Agent not found navigation.ts line 55');
    }
    return agent.firstName.substring(0, 1) + agent.lastName.substring(0, 1);
  }
  async getAgentFirstName(): Promise<string> {
    const agent = await this.contactData.agents.get(this.Dao.agent.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent.firstName;
  }
  async getAgentLastName(): Promise<string> {
    const agent = await this.contactData.agents.get(this.Dao.agent.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent.lastName;
  }
  async getMyCaseloadCount(): Promise<number> {
    return (await this.contactData.myCaseload.toArray()).length;
  }
  async getOtherOffendersCount(): Promise<number> {
    return (await this.contactData.otherOffenders.toArray()).length;
  }
  async getCaseloadOffenderById(id: number): Promise<Offender | undefined> {
    return await this.contactData.myCaseload.get(id);
  }
  async getOtherOffendersOffenderById(id: number): Promise<Offender | undefined> {
    return await this.contactData.otherOffenders.get(id);
  }
  async addOffenderToMyCaseload(offender: Offender): Promise<void> {
    await this.contactData.myCaseload.add(offender);
  }
  async addOffenderToOtherOffenderList(offender: Offender): Promise<void> {
    await this.contactData.otherOffenders.add(offender);
  }
  async removeOffenderFromMyCaseload(offender: Offender): Promise<void> {
    await this.contactData.myCaseload.delete(offender.ofndrNum);
  }
  async removeOffenderFromOtherOffenders(offender: Offender): Promise<void> {
    await this.contactData.otherOffenders.delete(offender.ofndrNum);
  }
  
  constructor() {}
}

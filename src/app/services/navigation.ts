import { Injectable } from '@angular/core';
import { Offender } from '../model/Offender';
import { Agent } from '../model/Agent';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  protected agent: Agent = {
    agentId: 'jshardlow',
    firstName: 'Jeff',
    lastName: 'Shardlow',
    fullName: 'Jeff Shardlow',
    email: 'jshardlow@utah.gov',
    image: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    supervisorId: 'kchunt',
    myCaseload: ([] = [
      {
        ofndrNum: 1,
        firstName: 'Yogi',
        lastName: 'Bear',
        image: '',
        address: '123 Main St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '',
        phone: '',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 2,
        firstName: 'Papa',
        lastName: 'Smurf',
        image: '',
        address: '234 Main St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '84101',
        phone: '801-123-4567',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 3,
        firstName: 'Sneezy',
        lastName: 'Dwarf',
        image: '',
        address: '345 Center St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '84101',
        phone: '801-234-5678',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 4,
        firstName: 'Sleepy',
        lastName: 'Dwarf',
        image: '',
        address: '1234 West Temple',
        city: 'South Salt Lake City',
        state: 'UT',
        zip: '84115',
        phone: '385-345-6789',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 5,
        firstName: 'Smurfette',
        lastName: 'Smurf',
        image: '',
        address: '9212 700 E.',
        city: 'Magna',
        state: 'UT',
        zip: '84111',
        phone: '385-456-7890',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 6,
        firstName: 'Dopey',
        lastName: 'Dwarf',
        image: '',
        address: '67 American Ave.',
        city: 'Murray',
        state: 'UT',
        zip: '84123',
        phone: '435-567-8901',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 7,
        firstName: 'Grumpy',
        lastName: 'Dwarf',
        image: '',
        address: '12324 Minuteman Dr.',
        city: 'Draper',
        state: 'UT',
        zip: '84044',
        phone: '385-678-9012',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 8,
        firstName: 'Bashful',
        lastName: 'Dwarf',
        image: '',
        address: '8523 Redwood Rd.',
        city: 'South Jordan',
        state: 'UT',
        zip: '84088',
        phone: '435-789-0123',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 9,
        firstName: 'Happy',
        lastName: 'Dwarf',
        image: '',
        address: '735 500W',
        city: 'Moab',
        state: 'UT',
        zip: '84452',
        phone: '801-890-1234',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 10,
        firstName: 'Snow',
        lastName: 'White',
        image: '',
        address: '345 State St.',
        city: 'Logan',
        state: 'UT',
        zip: '84567',
        phone: '435-901-2345',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
    ]),
    otherOffenders: ([] = [
      {
        ofndrNum: 1,
        firstName: 'Yogi',
        lastName: 'Bear',
        image: '',
        address: '123 Main St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '',
        phone: '',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 2,
        firstName: 'Papa',
        lastName: 'Smurf',
        image: '',
        address: '234 Main St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '84101',
        phone: '801-123-4567',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 3,
        firstName: 'Sneezy',
        lastName: 'Dwarf',
        image: '',
        address: '345 Center St.',
        city: 'Salt Lake City',
        state: 'UT',
        zip: '84101',
        phone: '801-234-5678',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 4,
        firstName: 'Sleepy',
        lastName: 'Dwarf',
        image: '',
        address: '1234 West Temple',
        city: 'South Salt Lake City',
        state: 'UT',
        zip: '84115',
        phone: '385-345-6789',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 5,
        firstName: 'Smurfette',
        lastName: 'Smurf',
        image: '',
        address: '9212 700 E.',
        city: 'Magna',
        state: 'UT',
        zip: '84111',
        phone: '385-456-7890',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 6,
        firstName: 'Dopey',
        lastName: 'Dwarf',
        image: '',
        address: '67 American Ave.',
        city: 'Murray',
        state: 'UT',
        zip: '84123',
        phone: '435-567-8901',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 7,
        firstName: 'Grumpy',
        lastName: 'Dwarf',
        image: '',
        address: '12324 Minuteman Dr.',
        city: 'Draper',
        state: 'UT',
        zip: '84044',
        phone: '385-678-9012',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 8,
        firstName: 'Bashful',
        lastName: 'Dwarf',
        image: '',
        address: '8523 Redwood Rd.',
        city: 'South Jordan',
        state: 'UT',
        zip: '84088',
        phone: '435-789-0123',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 9,
        firstName: 'Happy',
        lastName: 'Dwarf',
        image: '',
        address: '735 500W',
        city: 'Moab',
        state: 'UT',
        zip: '84452',
        phone: '801-890-1234',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
      {
        ofndrNum: 10,
        firstName: 'Snow',
        lastName: 'White',
        image: '',
        address: '345 State St.',
        city: 'Logan',
        state: 'UT',
        zip: '84567',
        phone: '435-901-2345',
        lastSuccessfulContactDate: new Date(),
        contactArray: [],
      },
    ]),
  };

  protected officerList: Agent[] = [
    {
      agentId: 'kchunt',
      firstName: 'Kurt',
      lastName: 'Hunt',
      fullName: 'Kurt Hunt',
      email: 'kchunt@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlow',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
    {
      agentId: 'jshardlow',
      firstName: 'Jeff',
      lastName: 'Shardlow',
      fullName: 'Jeff Shardlow',
      email: 'jshardlow@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'kchunt',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
    {
      agentId: 'mromney',
      firstName: 'Matt',
      lastName: 'Romney',
      fullName: 'Matt Romney',
      email: 'mromney@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlow',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
    {
      agentId: 'tjones',
      firstName: 'Tess',
      lastName: 'Jones',
      fullName: 'Tess Jones',
      email: 'tjones@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlow',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
    {
      agentId: 'jules',
      firstName: 'Jules',
      lastName: 'Hill',
      fullName: 'Jules Hill',
      email: 'jules@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlow',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
    {
      agentId: 'hicks',
      firstName: 'John',
      lastName: 'Hicks',
      fullName: 'John Hicks',
      email: 'hicks@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlow',
      myCaseload: ([] = []),
      otherOffenders: ([] = []),
    },
  ];
  getOfficerByAgentId(id: string): Agent | undefined {
    return this.officerList.find((x) => x.agentId === id);
  }
  getOfficerList(): Agent[] {
    return this.officerList;
  }
  getListOfOfficers(): Agent[] {
    return this.officerList;
  }
  getMyCaseload(): Offender[] {
    return this.agent.myCaseload;
  }
  getOtherOffenders(): Offender[] {
    return this.agent.otherOffenders;
  }
  getAgent(): Agent {
    return this.agent;
  }
  getAgentInitials(): string {
    return (
      this.agent.firstName.substring(0, 1) + this.agent.lastName.substring(0, 1)
    );
  }
  getAgentFirstName(): string {
    return this.agent.firstName;
  }
  getAgentLastName(): string {
    return this.agent.lastName;
  }
  getMyCaseloadCount(): number {
    return this.agent.myCaseload.length;
  }
  getOtherOffendersCount(): number {
    return this.agent.otherOffenders.length;
  }
  getCaseloadOffenderById(id: number): Offender | undefined {
    return this.agent.myCaseload.find((x) => x.ofndrNum === id);
  }
  getOtherOffendersOffenderById(id: number): Offender | undefined {
    return this.agent.otherOffenders.find((x) => x.ofndrNum === id);
  }
  addOffenderToMyCaseload(offender: Offender): void {
    this.agent.myCaseload.push(offender);
  }
  addOffenderToOtherOffenderList(offender: Offender): void {
    this.agent.otherOffenders.push(offender);
  }
  removeOffenderFromMyCaseload(offender: Offender): void {
    this.agent.myCaseload = this.agent.myCaseload.filter(
      (x) => x.ofndrNum !== offender.ofndrNum
    );
  }
  removeOffenderFromOtherOffenders(offender: Offender): void {
    this.agent.otherOffenders = this.agent.otherOffenders.filter(
      (x) => x.ofndrNum !== offender.ofndrNum
    );
  }
  constructor() {}
}

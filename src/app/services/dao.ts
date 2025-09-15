import { Injectable } from '@angular/core';
import { Agent } from '../model/Agent';
import { Select2Model } from '../model/Select2Model';
import { Offender } from '../model/Offender';
import { OffenderBase } from '../model/OffenderBase';
import { LegalStatus } from '../model/LegalStatus';

@Injectable({
  providedIn: 'root',
})
export class Dao {
  public otherOffenders: Offender[] = [];

  //self explanatory
  public myCaseload: Offender[] = [];

  //basic offender info for all other offenders in AP&P program
  public allOtherOffenders: OffenderBase[] = [];

  public allOtherOffendersWithContactInfo: Offender[] = [];

  public officerList: Agent[] = [
    {
      userId: '1',
      agentId: 'kchunt',
      firstName: 'Kurt',
      lastName: 'Hunt',
      name: 'Kurt Hunt',
      agentEmail: 'kchunt@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
    {
      userId: '1',
      agentId: 'abadger',
      firstName: 'Austin',
      lastName: 'Badger',
      name: 'Austin Badger',
      agentEmail: 'abadger@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: true,
    },
    {
      userId: '2',
      agentId: 'jshardlo',
      firstName: 'Jeff',
      lastName: 'Shardlow',
      name: 'Jeff Shardlow',
      agentEmail: 'jshardlo@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'kchunt',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
    {
      userId: '3',
      agentId: 'mromney',
      firstName: 'Matt',
      lastName: 'Romney',
      name: 'Matt Romney',
      agentEmail: 'mromney@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
    {
      userId: '4',
      agentId: 'tjones',
      firstName: 'Tess',
      lastName: 'Jones',
      name: 'Tess Jones',
      agentEmail: 'tjones@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
    {
      userId: '5',
      agentId: 'jules',
      firstName: 'Jules',
      lastName: 'Hill',
      name: 'Jules Hill',
      agentEmail: 'jules@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
    {
      userId: '6',
      agentId: 'hicks',
      firstName: 'John',
      lastName: 'Hicks',
      name: 'John Hicks',
      agentEmail: 'hicks@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
      primaryUser: false,
    },
  ];

  constructor() {}
}

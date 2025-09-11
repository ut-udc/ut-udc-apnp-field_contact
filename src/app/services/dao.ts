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

  public otherOffenders: Offender[] = [
  ];

  //self explanatory
  public myCaseload: Offender[] = [
  ];

  //basic offender info for all other offenders in AP&P program
  public allOtherOffenders: OffenderBase[] = [
  ];

  public allOtherOffendersWithContactInfo: Offender[] = [
  ];

  public officerList: Agent[] = [
    {
      userId: '1',
      agentId: 'kchunt',
      firstName: 'Kurt',
      lastName: 'Hunt',
      fullName: 'Kurt Hunt',
      agentEmail: 'kchunt@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
    {
      userId: '1',
      agentId: 'abadger',
      firstName: 'Austin',
      lastName: 'Badger',
      fullName: 'Austin Badger',
      agentEmail: 'abadger@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
    {
      userId: '2',
      agentId: 'jshardlo',
      firstName: 'Jeff',
      lastName: 'Shardlow',
      fullName: 'Jeff Shardlow',
      agentEmail: 'jshardlo@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'kchunt',
      ofndrNumList: ([] = []),
    },
    {
      userId: '3',
      agentId: 'mromney',
      firstName: 'Matt',
      lastName: 'Romney',
      fullName: 'Matt Romney',
      agentEmail: 'mromney@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
    {
      userId: '4',
      agentId: 'tjones',
      firstName: 'Tess',
      lastName: 'Jones',
      fullName: 'Tess Jones',
      agentEmail: 'tjones@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
    {
      userId: '5',
      agentId: 'jules',
      firstName: 'Jules',
      lastName: 'Hill',
      fullName: 'Jules Hill',
      agentEmail: 'jules@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
    {
      userId: '6',
      agentId: 'hicks',
      firstName: 'John',
      lastName: 'Hicks',
      fullName: 'John Hicks',
      agentEmail: 'hicks@utah.gov',
      image: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      supervisorId: 'jshardlo',
      ofndrNumList: ([] = []),
    },
  ];


  constructor() {}
}

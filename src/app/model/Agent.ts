import { Offender } from './Offender';

export interface Agent {
  agentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  image: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  supervisorId: string;
  ofndrNumList: number[];
}

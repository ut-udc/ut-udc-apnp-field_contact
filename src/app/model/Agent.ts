export interface Agent {
  userId: string;
  agentId: string;
  firstName: string;
  lastName: string;
  name: string;
  agentEmail: string;
  image: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  supervisorId: string;
  ofndrNumList: number[];
  primaryUser: boolean;
}

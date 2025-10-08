export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  agentEmail: string;
  guid: string;
  loggedInUser: number;
  tester?: number
}

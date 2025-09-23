import {AgentName} from './agent-name';

export interface Contact {
  contactId: number;
  offenderNumber: number;
  primaryInterviewer: AgentName;
  secondaryInterviewer: AgentName;
  contactDate: Date;
  contactTime: string;
  contactTimeString: string;
  contactTypeId: number; //contact type id
  contactType: string;
  locationId: number; //location id
  location: string; //PWA internal use only
  summary: string; //contact commentary
  formCompleted: boolean; //PWA internal use only
  firstPageCompleted: boolean; //PWA internal use only
  wasContactSuccessful: number; // 0 = attempted, 1 = successful
  contactSyncedWithDatabase: boolean; //always 1 from database
  userAgent: string; //Device ID on which this app was used
}

import {AgentName} from './agent-name';

export interface ContactRecordForBff {
  contactId: number;
  offenderNumber: number;
  summary: string;
  locationId: number;
  contactTypeId: number;
  primaryInterviewer: AgentName;
  secondaryInterviewer?: AgentName;
  result: number;
  contactDate: string;
  contactTime: string;
  userAgent: string;
}

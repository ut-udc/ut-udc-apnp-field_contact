import { DefaultOffenderName } from './DefaultOffenderName';

export interface OffenderBase {
  offenderNumber: number;
  defaultOffenderName: DefaultOffenderName;
  birthDate: Date;
  agentId: string;
}

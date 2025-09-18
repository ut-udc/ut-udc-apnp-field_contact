import {DefaultOffenderName} from './default-offender-name';

export interface OffenderBase {
  offenderNumber: number;
  defaultOffenderName: DefaultOffenderName;
  birthDate: Date;
  agentId: string;
}

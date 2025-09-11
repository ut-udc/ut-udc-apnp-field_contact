import { Contact } from './Contact';
import { OffenderAddress } from './OffenderAddress';
import { OffenderBase } from './OffenderBase';
import { LegalStatus } from './LegalStatus';

export interface Offender extends OffenderBase {
  image: string;
  offenderAddress: OffenderAddress;
  phone: string;
  lastSuccessfulContactDate: Date;
  contactArray: Contact[];
  nextScheduledContactDate: Date;
  legalStatus: string;
}

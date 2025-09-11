import { Contact } from './Contact';
import { OffenderAddress } from './OffenderAddress';
import { OffenderBase } from './OffenderBase';
import { LatestSuccessfulContact } from './LatestSuccessfulContact';

export interface Offender extends OffenderBase {
  image: Blob;
  offenderAddress: OffenderAddress;
  phone: string;
  lastSuccessfulContactDate: Date;
  contactArray: Contact[];
  nextScheduledContactDate: Date;
  legalStatus: string;
  lastSuccessfulContact: LatestSuccessfulContact;
}

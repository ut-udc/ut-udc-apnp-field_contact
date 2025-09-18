import {OffenderBase} from './offender-base';
import {Contact} from './contact';
import {LatestSuccessfulContact} from './latest-successful-contact';
import {OffenderAddress} from './offender-address';

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

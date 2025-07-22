import { Contact } from './Contact';
import { OffenderBase } from './OffenderBase';

export interface Offender extends OffenderBase {
  image: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lastSuccessfulContactDate: Date;
  contactArray: Contact[];

  
}

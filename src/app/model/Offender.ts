import { Contact } from './Contact';

export interface Offender {
  ofndrNum: number;
  firstName: string;
  lastName: string;
  image: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lastSuccessfulContactDate: Date;
  contactArray: Contact[];
}

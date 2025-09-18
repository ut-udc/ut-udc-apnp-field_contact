import {Contact} from './contact';

export interface QueuedContact {
  id?: number;
  method: string;
  url: string;
  body: Contact;
}

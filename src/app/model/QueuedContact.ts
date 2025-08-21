import { Contact } from './Contact';

export interface QueuedContact {
  id?: number;
  method: string;
  url: string;
  body: Contact;
}

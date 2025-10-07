import {ContactRecordForBff} from './contact-record-for-bff';

export interface QueuedContact {
  id?: number;
  method: string;
  url: string;
  body: ContactRecordForBff;
}

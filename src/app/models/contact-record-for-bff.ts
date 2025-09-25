export interface ContactRecordForBff {
  contactId: number;
  offenderNumber: number;
  summary: string;
  locationId: number;
  contactTypeId: number;
  primaryInterviewer: string;
  secondaryInterviewer?: string;
  result: number;
  contactDate: string;
  contactTime: string;
}

export interface Contact {
  contactId: number;
  offenderNumber: number;
  primaryInterviewer: string;
  secondaryInterviewer: string;
  contactDate: Date;
  contactTime: Date;
  contactTimeString: string;
  contactTypeId: number; //contact type id
  contactTypeDesc: string;
  locationId: number; //location id
  locationDesc: string; //PWA internal use only
  summary: string; //contact commentary
  formCompleted: boolean; //PWA internal use only
  firstPageCompleted: boolean; //PWA internal use only
  wasContactSuccessful: number; // 0 = attempted, 1 = successful
  contactSyncedWithDatabase: boolean; //always 1 from database
  userAgent: string; //Device ID on which this app was used
}

export interface Contact {
  contactId: number;
  offenderNumber: number;
  agentId: string;
  secondaryAgentId: string;
  contactDate: Date;
  contactTypeCd: string; //contact type code
  contactTypeDesc: string;
  locationCd: string; //location code
  locationDesc: string; //PWA internal use only
  commentary: string; //contact commentary
  formCompleted: boolean; //PWA internal use only
  firstPageCompleted: boolean; //PWA internal use only
  wasContactSuccessful: number; // 0 = attempted, 1 = successful
  contactSyncedWithDatabase: boolean; //always 1 from database
  userAgent: string; //Device ID on which this app was used
}

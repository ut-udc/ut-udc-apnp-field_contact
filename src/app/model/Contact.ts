export interface Contact {
  contactId: number;
  ofndrNum: number;
  agentId: string;
  secondaryAgentId: string;
  contactDate: Date;
  contactType: string;
  contactTypeDesc: string;
  location: string;
  locationDesc: string;
  commentary: string;
  formCompleted: boolean;
  firstPageCompleted: boolean;
  wasContactSuccessful: boolean;
  contactSyncedWithDatabase: boolean;
}

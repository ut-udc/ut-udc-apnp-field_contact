export interface Contact {
  contactId: number;
  ofndrNum: number;
  agentId: string;
  agentFullName: string;
  secondaryAgentId: string;
  secondaryAgentFullName: string;
  contactDate: Date;
  contactType: string;
  contactTypeDesc: string;
  location: string;
  locationDesc: string;
  commentary: string;
  formCompleted: boolean;
  firstPageCompleted: boolean;
  wasContactSuccessful: boolean;
}

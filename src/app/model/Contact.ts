export interface Contact {
    contactId: number;
    ofndrNum: number;
    agentId: string;
    secondaryAgentId: string;
    contactDate: Date;
    contactType: string;
    location: string;
    commentary: string;
    formCompleted: boolean;
    previouslySuccessful: boolean;
}
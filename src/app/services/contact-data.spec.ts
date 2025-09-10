import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContactData } from './contact-data';
import { Contact } from '../model/Contact';
import { Agent } from '../model/Agent';
import { Offender } from '../model/Offender';
import { Dao } from './dao';

describe('ContactData', () => {
  let service: ContactData;
  let mockDao: jasmine.SpyObj<Dao>;

  const mockContact: Contact = {
    contactId: 1,
    offenderNumber: 12345,
    agentId: 'agent1',
    secondaryAgentId: 'agent2',
    contactDate: new Date('2024-01-01'),
    contactType: '1',
    contactTypeDesc: 'Office Visit',
    location: '1',
    locationDesc: 'Main Office',
    commentary: 'Test contact',
    formCompleted: true,
    firstPageCompleted: true,
    wasContactSuccessful: true,
  };

  const mockAgent: Agent = {
    agentId: 'agent1',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    image: 'agent1.jpg',
    address: '123 Main St',
    city: 'Anytown',
    state: 'ST',
    zip: '12345',
    supervisorId: 'supervisor1',
    ofndrNumList: [12345, 67890],
  };

  const mockOffender: Offender = {
    offenderNumber: 12345,
    firstName: 'Jane',
    lastName: 'Smith',
    birthDate: new Date('1990-01-01'),
    image: 'offender1.jpg',
    address: '456 Oak St',
    city: 'Anytown',
    state: 'ST',
    zip: '12345',
    phone: '555-0123',
    lastSuccessfulContactDate: new Date('2024-01-01'),
    contactArray: [],
  };

  beforeEach(async () => {
    const daoSpy = jasmine.createSpyObj('Dao', [], {
      agent: mockAgent,
      myCaseload: [mockOffender],
      otherOffenders: [],
      locationList: [{ id: 1, text: 'Main Office' }],
      contactTypeList: [{ id: 1, text: 'Office Visit' }],
      officerList: [mockAgent],
    });

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactData, { provide: Dao, useValue: daoSpy }],
    });

    service = TestBed.inject(ContactData);
    mockDao = TestBed.inject(Dao) as jasmine.SpyObj<Dao>;
  });

  afterEach(async () => {
    await service.deleteDatabase();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Contact Operations', () => {
    it('should add a contact', async () => {
      await service.populateLocations();
      await service.populateContactTypes();

      await service.addContact(mockContact);
      const contacts = await service.getAllContacts();

      expect(contacts.length).toBe(1);
      expect(contacts[0].contactId).toBe(mockContact.contactId);
    });

    it('should update a contact', async () => {
      await service.populateLocations();
      await service.populateContactTypes();
      await service.addContact(mockContact);

      const updatedContact = {
        ...mockContact,
        commentary: 'Updated commentary',
      };
      await service.updateContact(updatedContact);

      const contact = await service.getContactById(mockContact.contactId);
      expect(contact.commentary).toBe('Updated commentary');
    });

    it('should get contact by id', async () => {
      await service.populateLocations();
      await service.populateContactTypes();
      await service.addContact(mockContact);

      const contact = await service.getContactById(mockContact.contactId);
      expect(contact.contactId).toBe(mockContact.contactId);
      expect(contact.offenderNumber).toBe(mockContact.offenderNumber);
    });

    it('should get contacts by offender number', async () => {
      await service.populateLocations();
      await service.populateContactTypes();
      await service.addContact(mockContact);

      const contacts = await service.getAllContactsByOffenderNumberDesc(
        mockContact.offenderNumber
      );
      expect(contacts.length).toBe(1);
      expect(contacts[0].offenderNumber).toBe(mockContact.offenderNumber);
    });

    it('should get contact count', async () => {
      await service.populateLocations();
      await service.populateContactTypes();
      await service.addContact(mockContact);

      const count = await service.getContactCount();
      expect(count).toBe(1);
    });
  });

  describe('Agent Operations', () => {
    it('should populate and get agent', async () => {
      await service.populateAgent();
      const agent = await service.getAgent();

      expect(agent?.agentId).toBe(mockAgent.agentId);
      expect(agent?.fullName).toBe(mockAgent.fullName);
    });

    it('should get agent by id', async () => {
      await service.populateAgent();
      const agent = await service.getAgentById(mockAgent.agentId);

      expect(agent.agentId).toBe(mockAgent.agentId);
    });

    it('should get interviewer options', async () => {
      await service.populateOfficers();
      const options = await service.getInterviewerOptions();

      expect(options.length).toBeGreaterThan(0);
      expect(options[0].id).toBe(mockAgent.agentId);
      expect(options[0].text).toBe(mockAgent.fullName);
    });
  });

  describe('Offender Operations', () => {
    it('should populate and get caseload', async () => {
      await service.populateMyCaseload();
      const caseload = await service.getMyCaseload();

      expect(caseload.length).toBe(1);
      expect(caseload[0].offenderNumber).toBe(mockOffender.offenderNumber);
    });

    it('should get caseload offender by id', async () => {
      await service.populateMyCaseload();
      const offender = await service.getCaseloadOffenderById(
        mockOffender.offenderNumber
      );

      expect(offender?.offenderNumber).toBe(mockOffender.offenderNumber);
      expect(offender?.firstName).toBe(mockOffender.firstName);
    });
  });

  describe('Reference Data Operations', () => {
    it('should populate and get locations', async () => {
      await service.populateLocations();
      const locations = await service.getListOfLocations();

      expect(locations.length).toBeGreaterThan(0);
      expect(locations[0].text).toBe('Main Office');
    });

    it('should populate and get contact types', async () => {
      await service.populateContactTypes();
      const contactTypes = await service.getListOfContactTypes();

      expect(contactTypes.length).toBeGreaterThan(0);
      expect(contactTypes[0].text).toBe('Office Visit');
    });

    it('should get location description by id', async () => {
      await service.populateLocations();
      const locationDesc = await service.getLocationDescById('1');

      expect(locationDesc).toBe('Main Office');
    });

    it('should get contact type description by id', async () => {
      await service.populateContactTypes();
      const contactTypeDesc = await service.getContactTypeDescById('1');

      expect(contactTypeDesc).toBe('Office Visit');
    });
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import ContactForm from './contact-form';
import {ContactData} from '../../services/contact-data';
import {Navigation} from '../../services/navigation';
import {Contact} from '../../model/Contact';
import {Offender} from '../../model/Offender';

describe('ContactForm', () => {
  let component: ContactForm;
  let fixture: ComponentFixture<ContactForm>;
  let mockContactData: jasmine.SpyObj<ContactData>;
  let mockNavigation: jasmine.SpyObj<Navigation>;

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

  const mockContact: Contact = {
    contactId: 1,
    offenderNumber: 12345,
    primaryInterviewer: 'agent1',
    secondaryInterviewer: 'agent2',
    contactDateTime: new Date('2024-01-01'),
    contactType: '1',
    location: 'Office Visit',
    location: '1',
    location: 'Main Office',
    summary: 'Test contact',
    formCompleted: false,
    firstPageCompleted: false,
    wasContactSuccessful: false,
  };

  beforeEach(async () => {
    const contactDataSpy = jasmine.createSpyObj(
      'ContactData',
      [
        'getCaseloadOffenderById',
        'getOtherOffendersOffenderById',
        'getContactById',
        'getUncompletedContactByOffenderNumber',
        'addContact',
        'updateContact',
        'getContactCount',
        'getAgentList',
        'getOfficerList',
        'getInterviewerOptions',
        'getListOfContactTypes',
        'getListOfLocations',
      ],
      {
        applicationUserName: 'agent1',
      }
    );

    const navigationSpy = jasmine.createSpyObj('Navigation', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ContactForm,
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ContactData, useValue: contactDataSpy },
        { provide: Navigation, useValue: navigationSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { offenderNumber: '12345', contactId: '1' },
            },
          },
        },
      ],
    }).compileComponents();

    mockContactData = TestBed.inject(
      ContactData
    ) as jasmine.SpyObj<ContactData>;
    mockNavigation = TestBed.inject(Navigation) as jasmine.SpyObj<Navigation>;

    // Setup default mock returns
    mockContactData.getCaseloadOffenderById.and.returnValue(
      Promise.resolve(mockOffender)
    );
    mockContactData.getOtherOffendersOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getContactById.and.returnValue(
      Promise.resolve(mockContact)
    );
    mockContactData.getUncompletedContactByOffenderNumber.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getContactCount.and.returnValue(Promise.resolve(5));
    mockContactData.getAgentList.and.returnValue(Promise.resolve([]));
    mockContactData.getOfficerList.and.returnValue(Promise.resolve([]));
    mockContactData.getInterviewerOptions.and.returnValue(
      Promise.resolve([{ id: 'agent1', text: 'John Doe' }])
    );
    mockContactData.getListOfContactTypes.and.returnValue(
      Promise.resolve([{ id: 1, text: 'Office Visit' }])
    );
    mockContactData.getListOfLocations.and.returnValue(
      Promise.resolve([{ id: 1, text: 'Main Office' }])
    );

    fixture = TestBed.createComponent(ContactForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with route parameters', async () => {
    await component.ngOnInit();

    expect(component.offenderNumber).toBe(12345);
    expect(component.contactId).toBe(1);
    expect(mockContactData.getCaseloadOffenderById).toHaveBeenCalledWith(12345);
  });

  it('should load offender data on initialization', async () => {
    await component.ngOnInit();

    expect(component.offender).toEqual(mockOffender);
    expect(mockContactData.getCaseloadOffenderById).toHaveBeenCalledWith(12345);
  });

  it('should load existing contact when contactId is provided', async () => {
    await component.ngOnInit();

    expect(component.currentContact.contactId).toBe(mockContact.contactId);
    expect(mockContactData.getContactById).toHaveBeenCalledWith(1);
  });

  it('should initialize form controls', () => {
    expect(component.contactForm.get('contactId')).toBeTruthy();
    expect(component.contactForm.get('contactDate')).toBeTruthy();
    expect(component.contactForm.get('primaryInterviewer')).toBeTruthy();
    expect(component.contactForm.get('contactType')).toBeTruthy();
    expect(component.contactForm.get('location')).toBeTruthy();
  });

  it('should add new contact on submit when contactId is 0', async () => {
    component.currentContact.contactId = 0;
    component.contactForm.patchValue({
      primaryInterviewer: 'agent1',
      contactDate: new Date(),
      contactType: '1',
      location: '1',
    });

    await component.onSubmit();

    expect(mockContactData.addContact).toHaveBeenCalled();
    expect(component.currentContact.firstPageCompleted).toBe(true);
  });

  it('should update existing contact on submit when contactId > 0', async () => {
    component.currentContact = {
      ...mockContact,
      contactId: 1,
      formCompleted: false,
    };
    component.contactForm.patchValue({
      primaryInterviewer: 'agent1',
      contactDate: new Date(),
      contactType: '1',
      location: '1',
    });

    await component.onSubmit();

    expect(mockContactData.updateContact).toHaveBeenCalled();
  });

  it('should populate dropdown options', (done) => {
    let completedObservables = 0;
    const totalObservables = 4;

    const checkCompletion = () => {
      completedObservables++;
      if (completedObservables === totalObservables) {
        done();
      }
    };

    component.primaryOfficers.subscribe((officers) => {
      expect(officers.length).toBeGreaterThan(0);
      checkCompletion();
    });

    component.contactTypeList.subscribe((types) => {
      expect(types.length).toBeGreaterThan(0);
      checkCompletion();
    });

    component.locationList.subscribe((locations) => {
      expect(locations.length).toBeGreaterThan(0);
      checkCompletion();
    });

    component.agentList.subscribe((agents) => {
      expect(Array.isArray(agents)).toBe(true);
      checkCompletion();
    });
  });

  it('should handle form validation', () => {
    const form = component.contactForm;

    expect(form.valid).toBe(false);

    form.patchValue({
      contactDate: new Date(),
      primaryInterviewer: 'agent1',
      contactType: '1',
      location: '1',
    });

    expect(form.get('contactDate')?.value).toBeTruthy();
    expect(form.get('primaryInterviewer')?.value).toBe('agent1');
  });

  it('should fallback to other offenders if not in caseload', async () => {
    mockContactData.getCaseloadOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getOtherOffendersOffenderById.and.returnValue(
      Promise.resolve(mockOffender)
    );

    await component.ngOnInit();

    expect(mockContactData.getOtherOffendersOffenderById).toHaveBeenCalledWith(
      12345
    );
    expect(component.offender).toEqual(mockOffender);
  });
});

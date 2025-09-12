import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { OffenderDetail } from './offender-detail';
import { ContactData } from '../../services/contact-data';
import { Contact } from '../../model/Contact';
import { Offender } from '../../model/Offender';
import { LegalStatus } from '../../model/LegalStatus';

describe('OffenderDetail', () => {
  let component: OffenderDetail;
  let fixture: ComponentFixture<OffenderDetail>;
  let mockContactData: jasmine.SpyObj<ContactData>;

  const mockOffender: Offender = {
    offenderNumber: 12345,
    birthDate: new Date('1990-01-01'),
    defaultOffenderName: {
      firstName: 'Jane',
      lastName: 'Smith',
    },
    agentId: 'jshardlo',
    image: 'offender1.jpg',
    offenderAddress: {
      offenderNumber: 12345,
      lineOne: '456 Oak St',
      lineTwo: '',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
    },
    phone: '555-0123',
    lastSuccessfulContactDate: new Date('2024-01-01'),
    nextScheduledContactDate: new Date('2024-02-01'),
    contactArray: [],
    legalStatus: {} as LegalStatus,
  };

  const mockContacts: Contact[] = [
    {
      contactId: 1,
      offenderNumber: 12345,
      primaryInterviewer: 'jshardlo',
      secondaryInterviewer: '',
      contactDateTime: new Date('2024-01-01'),
      contactTypeCode: 1,
      contactTypeDesc: 'Office Visit',
      locationId: 1,
      locationDesc: 'Main Office',
      summary: 'First contact',
      formCompleted: true,
      firstPageCompleted: true,
      wasContactSuccessful: 1,
      contactSyncedWithDatabase: true,
      userAgent: 'test-user-agent',
    },
    {
      contactId: 2,
      offenderNumber: 12345,
      primaryInterviewer: 'jshardlo',
      secondaryInterviewer: '',
      contactDateTime: new Date('2024-01-02'),
      contactTypeCode: 2,
      contactTypeDesc: 'Phone Call',
      locationId: 2,
      locationDesc: 'Remote',
      summary: 'Second contact',
      formCompleted: true,
      firstPageCompleted: true,
      wasContactSuccessful: 1,
      contactSyncedWithDatabase: true,
      userAgent: 'test-user-agent',
    },
  ];

  beforeEach(async () => {
    const contactDataSpy = jasmine.createSpyObj('ContactData', [
      'getCaseloadOffenderById',
      'getOtherOffendersOffenderById',
      'getAllContactsByOffenderNumberDesc',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OffenderDetail,
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ContactData, useValue: contactDataSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { offenderNumber: '12345' },
            },
          },
        },
      ],
    }).compileComponents();

    mockContactData = TestBed.inject(
      ContactData
    ) as jasmine.SpyObj<ContactData>;

    // Setup default mock returns
    mockContactData.getCaseloadOffenderById.and.returnValue(
      Promise.resolve(mockOffender)
    );
    mockContactData.getOtherOffendersOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getAllContactsByOffenderNumberDesc.and.returnValue(
      Promise.resolve(mockContacts)
    );

    fixture = TestBed.createComponent(OffenderDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current offender from caseload', (done) => {
    component.currentOffender.subscribe((offender) => {
      expect(offender.offenderNumber).toBe(mockOffender.offenderNumber);
      expect(offender.defaultOffenderName.firstName).toBe(
        mockOffender.defaultOffenderName.firstName
      );
      expect(offender.defaultOffenderName.lastName).toBe(
        mockOffender.defaultOffenderName.lastName
      );
      expect(mockContactData.getCaseloadOffenderById).toHaveBeenCalledWith(
        12345
      );
      done();
    });
  });

  it('should fallback to other offenders if not in caseload', (done) => {
    mockContactData.getCaseloadOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getOtherOffendersOffenderById.and.returnValue(
      Promise.resolve(mockOffender)
    );

    component.currentOffender.subscribe((offender) => {
      expect(offender.offenderNumber).toBe(mockOffender.offenderNumber);
      expect(
        mockContactData.getOtherOffendersOffenderById
      ).toHaveBeenCalledWith(12345);
      done();
    });
  });

  it('should load contact list for offender', (done) => {
    component.contactList.subscribe((contacts) => {
      expect(contacts.length).toBe(2);
      expect(contacts[0].contactId).toBe(1);
      expect(contacts[1].contactId).toBe(2);
      expect(
        mockContactData.getAllContactsByOffenderNumberDesc
      ).toHaveBeenCalledWith(12345);
      done();
    });
  });

  it('should handle empty contact list', (done) => {
    mockContactData.getAllContactsByOffenderNumberDesc.and.returnValue(
      Promise.resolve([])
    );

    component.contactList.subscribe((contacts) => {
      expect(contacts.length).toBe(0);
      done();
    });
  });

  it('should return empty offender if not found anywhere', (done) => {
    mockContactData.getCaseloadOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );
    mockContactData.getOtherOffendersOffenderById.and.returnValue(
      Promise.resolve(undefined)
    );

    component.currentOffender.subscribe((offender) => {
      expect(offender).toEqual({} as Offender);
      done();
    });
  });

  it('should initialize component properties', () => {
    expect(component.contactData).toBeTruthy();
    expect(component.route).toBeTruthy();
    expect(component.centered).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.unbounded).toBe(false);
    expect(component.radius).toBe(300);
    expect(component.color).toBe('rgba(207, 207, 207, 0.39)');
  });

  it('should render offender information and contact list', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    // Check if the component template renders
    expect(compiled).toBeTruthy();
  });

  it('should handle rgba method', () => {
    expect(() => component.rgba(207, 207, 207, 0.39)).toThrowError(
      'Method not implemented.'
    );
  });
});

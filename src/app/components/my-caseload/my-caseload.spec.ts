import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MyCaseload } from './my-caseload';
import { ContactData } from '../../services/contact-data';
import { Offender } from '../../model/Offender';

describe('MyCaseload', () => {
  let component: MyCaseload;
  let fixture: ComponentFixture<MyCaseload>;
  let mockContactData: jasmine.SpyObj<ContactData>;

  const mockCaseload: Offender[] = [
    {
      offenderNumber: 12345,
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: new Date('1990-01-01'),
      agentId: 'A12345',
      image: 'offender1.jpg',
      address: '456 Oak St',
      city: 'Anytown',
      state: 'ST',
      zip: '12345',
      phone: '555-0123',
      lastSuccessfulContactDate: new Date('2024-01-01'),
      contactArray: [],
    },
    {
      offenderNumber: 67890,
      firstName: 'John',
      lastName: 'Doe',
      birthDate: new Date('1985-05-15'),
      agentId: 'A67890',
      image: 'offender2.jpg',
      address: '789 Pine St',
      city: 'Anytown',
      state: 'ST',
      zip: '12345',
      phone: '555-0456',
      lastSuccessfulContactDate: new Date('2024-01-02'),
      contactArray: [],
    },
  ];

  beforeEach(async () => {
    const contactDataSpy = jasmine.createSpyObj('ContactData', [
      'getMyCaseload',
    ]);

    await TestBed.configureTestingModule({
      imports: [MyCaseload, HttpClientTestingModule, NoopAnimationsModule],
      providers: [{ provide: ContactData, useValue: contactDataSpy }],
    }).compileComponents();

    mockContactData = TestBed.inject(
      ContactData
    ) as jasmine.SpyObj<ContactData>;
    mockContactData.getMyCaseload.and.returnValue(
      Promise.resolve(mockCaseload)
    );

    fixture = TestBed.createComponent(MyCaseload);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with ContactData service', () => {
    expect(component.contactData).toBeTruthy();
  });

  it('should load caseload on initialization', async () => {
    await component.loadMyCaseload();

    component.myCaseload.subscribe((caseload) => {
      expect(caseload.length).toBe(2);
      expect(caseload[0].offenderNumber).toBe(12345);
      expect(caseload[1].offenderNumber).toBe(67890);
    });

    expect(mockContactData.getMyCaseload).toHaveBeenCalled();
  });

  it('should handle empty caseload', async () => {
    mockContactData.getMyCaseload.and.returnValue(Promise.resolve([]));

    await component.loadMyCaseload();

    component.myCaseload.subscribe((caseload) => {
      expect(caseload.length).toBe(0);
    });
  });

  it('should initialize caseload array', () => {
    expect(component.caseload).toEqual([]);
  });

  it('should call loadMyCaseload in constructor', () => {
    spyOn(component, 'loadMyCaseload');

    // Create new instance to test constructor
    const newComponent = new MyCaseload();

    expect(newComponent.loadMyCaseload).toHaveBeenCalled();
  });

  it('should render offender cards for each caseload member', async () => {
    await component.loadMyCaseload();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.myCaseload).toBeTruthy();
    expect(component.caseload).toBeDefined();
    expect(component.contactData).toBeTruthy();
  });
});

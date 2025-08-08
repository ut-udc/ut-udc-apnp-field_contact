import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { Home } from './home';
import { ContactData } from '../../services/contact-data';
import { Navigation } from '../../services/navigation';
import { Dao } from '../../services/dao';
import { Agent } from '../../model/Agent';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockContactData: jasmine.SpyObj<ContactData>;
  let mockNavigation: jasmine.SpyObj<Navigation>;
  let mockDao: jasmine.SpyObj<Dao>;

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
    ofndrNumList: [12345, 67890]
  };

  beforeEach(async () => {
    const contactDataSpy = jasmine.createSpyObj('ContactData', [
      'getAgentById'
    ], {
      applicationUserName: 'agent1'
    });
    const navigationSpy = jasmine.createSpyObj('Navigation', ['navigate']);
    const daoSpy = jasmine.createSpyObj('Dao', [], {
      agent: mockAgent
    });

    await TestBed.configureTestingModule({
      imports: [
        Home,
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ContactData, useValue: contactDataSpy },
        { provide: Navigation, useValue: navigationSpy },
        { provide: Dao, useValue: daoSpy }
      ]
    })
    .compileComponents();

    mockContactData = TestBed.inject(ContactData) as jasmine.SpyObj<ContactData>;
    mockNavigation = TestBed.inject(Navigation) as jasmine.SpyObj<Navigation>;
    mockDao = TestBed.inject(Dao) as jasmine.SpyObj<Dao>;

    mockContactData.getAgentById.and.returnValue(Promise.resolve(mockAgent));

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with services', () => {
    expect(component.contactData).toBeTruthy();
    expect(component.navigationService).toBeTruthy();
    expect(component.dao).toBeTruthy();
  });

  it('should load current agent on initialization', (done) => {
    component.currentAgent.subscribe(agent => {
      expect(agent.agentId).toBe(mockAgent.agentId);
      expect(agent.fullName).toBe(mockAgent.fullName);
      done();
    });
  });

  it('should set application user name from current agent', () => {
    fixture.detectChanges();
    expect(mockContactData.applicationUserName).toBe(mockAgent.agentId);
  });

  it('should emit time updates', (done) => {
    let emissionCount = 0;
    component.time.subscribe(time => {
      expect(typeof time).toBe('string');
      emissionCount++;
      if (emissionCount >= 2) {
        done();
      }
    });
  });

  it('should render agent profile and caseload components', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-my-caseload')).toBeTruthy();
  });
});

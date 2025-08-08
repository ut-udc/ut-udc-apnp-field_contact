import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Navigation } from './navigation';

describe('Navigation', () => {
  let service: Navigation;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    const locationSpy = jasmine.createSpyObj('Location', ['back', 'forward', 'go']);

    TestBed.configureTestingModule({
      providers: [
        Navigation,
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    });

    service = TestBed.inject(Navigation);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockLocation = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have router and location services', () => {
    expect(service['router']).toBeTruthy();
    expect(service['location']).toBeTruthy();
  });

  // Add more specific navigation tests based on the actual Navigation service implementation
  // These would depend on the specific methods available in the Navigation service
});
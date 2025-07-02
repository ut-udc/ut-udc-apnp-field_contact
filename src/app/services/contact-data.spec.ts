import { TestBed } from '@angular/core/testing';

import { ContactData } from './contact-data';

describe('ContactData', () => {
  let service: ContactData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

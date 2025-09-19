import {TestBed} from '@angular/core/testing';

import {OffenderService} from './offender-service';

describe('OffenderService', () => {
  let service: OffenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OffenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

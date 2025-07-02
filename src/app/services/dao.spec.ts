import { TestBed } from '@angular/core/testing';

import { Dao } from './dao';

describe('Dao', () => {
  let service: Dao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

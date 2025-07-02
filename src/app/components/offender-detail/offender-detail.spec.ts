import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffenderDetail } from './offender-detail';

describe('OffenderDetail', () => {
  let component: OffenderDetail;
  let fixture: ComponentFixture<OffenderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffenderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffenderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

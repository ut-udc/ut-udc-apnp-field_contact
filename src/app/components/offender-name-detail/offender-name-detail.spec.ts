import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OffenderNameDetail} from './offender-name-detail';

describe('OffenderNameDetail', () => {
  let component: OffenderNameDetail;
  let fixture: ComponentFixture<OffenderNameDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffenderNameDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffenderNameDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

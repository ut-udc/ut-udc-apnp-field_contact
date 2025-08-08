import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOffenderToOtherOffenders } from './add-offender-to-other-offenders';

describe('AddOffenderToOtherOffenders', () => {
  let component: AddOffenderToOtherOffenders;
  let fixture: ComponentFixture<AddOffenderToOtherOffenders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOffenderToOtherOffenders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOffenderToOtherOffenders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

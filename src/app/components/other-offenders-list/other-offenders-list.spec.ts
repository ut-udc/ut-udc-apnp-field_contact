import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherOffendersList } from './other-offenders-list';

describe('OtherOffendersList', () => {
  let component: OtherOffendersList;
  let fixture: ComponentFixture<OtherOffendersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherOffendersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherOffendersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

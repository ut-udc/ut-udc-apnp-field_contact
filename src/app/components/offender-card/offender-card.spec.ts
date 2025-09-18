import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffenderCard } from './offender-card';

describe('OffenderCard', () => {
  let component: OffenderCard;
  let fixture: ComponentFixture<OffenderCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffenderCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffenderCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

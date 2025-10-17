import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PhoneNumber} from './phone-number';

describe('PhoneNumber', () => {
  let component: PhoneNumber;
  let fixture: ComponentFixture<PhoneNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneNumber]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

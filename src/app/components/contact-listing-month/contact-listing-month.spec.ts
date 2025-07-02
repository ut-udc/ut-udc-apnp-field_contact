import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactListingMonth } from './contact-listing-month';

describe('ContactListingMonth', () => {
  let component: ContactListingMonth;
  let fixture: ComponentFixture<ContactListingMonth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListingMonth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactListingMonth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

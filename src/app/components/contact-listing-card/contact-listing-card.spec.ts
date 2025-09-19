import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ContactListingCard} from './contact-listing-card';

describe('ContactListingCard', () => {
  let component: ContactListingCard;
  let fixture: ComponentFixture<ContactListingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactListingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

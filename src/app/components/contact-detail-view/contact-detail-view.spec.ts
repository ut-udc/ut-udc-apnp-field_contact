import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetailView } from './contact-detail-view';

describe('ContactDetailView', () => {
  let component: ContactDetailView;
  let fixture: ComponentFixture<ContactDetailView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDetailView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineLabel } from './offline-label';

describe('OfflineLabel', () => {
  let component: OfflineLabel;
  let fixture: ComponentFixture<OfflineLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineLabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineLabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

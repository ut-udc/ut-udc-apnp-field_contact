import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCaseload } from './my-caseload';

describe('MyCaseload', () => {
  let component: MyCaseload;
  let fixture: ComponentFixture<MyCaseload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCaseload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCaseload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

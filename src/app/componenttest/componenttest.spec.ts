import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Componenttest } from './componenttest';

describe('Componenttest', () => {
  let component: Componenttest;
  let fixture: ComponentFixture<Componenttest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Componenttest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Componenttest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

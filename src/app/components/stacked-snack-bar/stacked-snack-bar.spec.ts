import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedSnackBar } from './stacked-snack-bar';

describe('StackedSnackBar', () => {
  let component: StackedSnackBar;
  let fixture: ComponentFixture<StackedSnackBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedSnackBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedSnackBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

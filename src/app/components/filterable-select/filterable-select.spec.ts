import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterableSelect } from './filterable-select';

describe('FilterableSelect', () => {
  let component: FilterableSelect;
  let fixture: ComponentFixture<FilterableSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterableSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterableSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

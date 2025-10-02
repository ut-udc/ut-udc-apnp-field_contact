import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyUserSelect } from './proxy-user-select';

describe('ProxyUserSelect', () => {
  let component: ProxyUserSelect;
  let fixture: ComponentFixture<ProxyUserSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProxyUserSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProxyUserSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

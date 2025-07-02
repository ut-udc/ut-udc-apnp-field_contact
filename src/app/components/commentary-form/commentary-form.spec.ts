import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentaryForm } from './commentary-form';

describe('CommentaryForm', () => {
  let component: CommentaryForm;
  let fixture: ComponentFixture<CommentaryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentaryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentaryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

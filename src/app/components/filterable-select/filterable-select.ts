import {Component, ElementRef, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ReactiveFormsModule, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import {MatSelectModule} from '@angular/material/select';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-filterable-select',
  standalone: true,
  imports: [MatSelectModule, CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule],
  templateUrl: './filterable-select.html',
  styleUrl: './filterable-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterableSelect),
      multi: true
    }
  ]
})
export class FilterableSelect implements OnInit, ControlValueAccessor {
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;
  @Input() label = '';
  @Input() options: any[] = [];
  @Input() placeholder = 'Search...';
  formControl = new FormControl('');
  filterControl = new FormControl('');
  filteredOptions!: Observable<any[]>;
  private onChange: any = () => {};
  private onTouched: any = () => {};
  constructor() {}

  ngOnInit(): void {
    this.formControl.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }
  private _filter(value: any): any[] {
    const filterValue = value?.toLowerCase?.() || '';
    return this.options.filter(o => o.text.toLowerCase().includes(filterValue));
  }

  getDisplayText(value: any): string {
    const found = this.options.find(o => o.id === value);
    return found ? found.text : 'Select';
  }

  trackOption(index: number, option: any) {
    return option.id;
  }

  writeValue(value: any): void {
    this.formControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  onOpened() {
    // Focus the input
    setTimeout(() => this.filterInput?.nativeElement.focus(), 0);
    this.filterOptions();
  }

  onFilterChange(event: Event) {
    this.filterOptions();
  }
  private filterOptions() {
    try {
      // Populate filtered options with all options when dropdown opens
      this.filteredOptions = new Observable(observer => {
        observer.next(this._filter(this.filterInput?.nativeElement.value || ''));
        observer.complete();
      });
    }catch(e){
      console.log(e);
    }
  }
}

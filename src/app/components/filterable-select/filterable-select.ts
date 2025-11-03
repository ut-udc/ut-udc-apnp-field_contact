import {Component, Input, forwardRef, signal, ViewChild, ElementRef} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-filterable-select',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatIconModule, MatInputModule],
  templateUrl: './filterable-select.html',
  styleUrl: './filterable-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterableSelect),
      multi: true,
    },
  ],
})
export class FilterableSelect implements ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() searchPlaceholder = 'Search';
  @Input() noOptionsText = 'No options found';
  @Input() set options(value: readonly any[]) {
    this._options = [...value];
    this.resetFilteredOptions();
  }

  protected readonly searchTerm = signal('');
  protected readonly filteredOptions = signal<any[]>([]);
  protected value: string | null = null;
  protected isDisabled = signal(false);

  private _options: any[] = [];
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    const normalized = term.trim().toLowerCase();

    if (!normalized) {
      this.resetFilteredOptions();
      return;
    }

    this.filteredOptions.set(
      this._options.filter((option) => option.text.toLowerCase().includes(normalized))
    );
  }

  protected onPanelToggled(open: boolean): void {
    if (!open) {
      this.onSearch('');
      this.onTouched();
      return;
    }
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  protected onValueChange(value: string | null): void {
    this.value = value;
    this.onChange(value);
  }

  private resetFilteredOptions(): void {
    this.filteredOptions.set([...this._options]);
  }
}

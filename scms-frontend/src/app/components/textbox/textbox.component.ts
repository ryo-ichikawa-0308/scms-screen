import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CUSTOM_INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextboxComponent),
  multi: true,
};
@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  providers: [CUSTOM_INPUT_VALUE_ACCESSOR],
})
export class TextboxComponent implements ControlValueAccessor {
  writeValue(value: string): void {
    this.value = value;
  }
  registerOnChange(fn: (_: any) => object): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => object): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @Input({ required: true }) id: string = '';
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() name: string = '';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  value: string = '';

  onChange = (newValue: string) => {
    this.value = newValue;
    this.valueChange.emit(newValue);
  };
  onTouched = () => {};
}

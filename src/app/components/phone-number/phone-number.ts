import {Component, inject, Input} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-phone-number',
  imports: [
    MatIcon
  ],
  templateUrl: './phone-number.html',
  styleUrl: './phone-number.scss'
})
export class PhoneNumber {
  @Input() phoneNumber: string | undefined;
  @Input() phoneType: string | undefined;

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'phone',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone.svg')
    );
  }
}

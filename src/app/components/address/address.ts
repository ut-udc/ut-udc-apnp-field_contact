import {Component, inject, Input} from '@angular/core';
import {OffenderAddress} from '../../models/offender-address';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-address',
  imports: [
    MatIcon
  ],
  templateUrl: './address.html',
  styleUrl: './address.scss'
})
export class Address {
  @Input({ transform: (value: OffenderAddress | undefined): OffenderAddress => value as OffenderAddress }) address!: OffenderAddress;
  @Input() addressType!: string | undefined;

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon(
      'location_on',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/location_on.svg')
    );
  }
}

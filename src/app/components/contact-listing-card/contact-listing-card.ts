import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-listing-card',
  imports: [MatIconModule],
  templateUrl: './contact-listing-card.html',
  styleUrl: './contact-listing-card.scss'
})
export class ContactListingCard {
  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon('arrow_back', sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/arrow_back.svg'));
    iconRegistry.addSvgIcon('add-white', sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/add-white.svg'));
    iconRegistry.addSvgIcon('location_on', sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/location_on.svg'));
    iconRegistry.addSvgIcon('phone', sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/phone.svg'));
    iconRegistry.addSvgIcon('note', sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/note.svg'));
  }
}

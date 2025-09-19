import {Component, inject, Input, OnInit} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {CommonModule, DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';
import {Contact} from '../../models/contact';
import {Db} from '../../services/db';

@Component({
  selector: 'app-contact-listing-card',
  standalone: true,
  imports: [MatIconModule, DatePipe, RouterLink, CommonModule],
  templateUrl: './contact-listing-card.html',
  styleUrl: './contact-listing-card.scss',
})
export class ContactListingCard implements OnInit {
  @Input() contact!: Contact;
  db: Db = inject(Db);
  async getContactTypeById(id: number) {
    return await this.db.contactTypes.get(Number(id));
  }

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
    iconRegistry.addSvgIcon(
      'add-white',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-white.svg')
    );
    iconRegistry.addSvgIcon(
      'location_on',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/location_on.svg')
    );
    iconRegistry.addSvgIcon(
      'phone',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone.svg')
    );
    iconRegistry.addSvgIcon(
      'note',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/note.svg')
    );
  }
  ngOnInit(): void {
    console.log('Contact: ', this.contact);
  }

  truncateChar(text: string): string {
    let charlimit = 80;
    if (!text || text.length <= charlimit) {
      return text;
    }

    let without_html = text.replace(/<(?:.|\n)*?>/gm, '');
    let shortened = without_html.substring(0, charlimit) + '...';
    return shortened;
  }
}

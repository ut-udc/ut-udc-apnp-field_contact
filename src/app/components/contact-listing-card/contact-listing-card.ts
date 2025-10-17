import {Component, inject, Input, OnInit} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {CommonModule, DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Contact} from '../../models/contact';
import {Db} from '../../services/db';

@Component({
  selector: 'app-contact-listing-card',
  standalone: true,
  imports: [MatIconModule, DatePipe, RouterLink, CommonModule, RouterLinkActive],
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
      'note',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/note.svg')
    );
  }
  ngOnInit(): void {
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
  truncateTimeString(text: string): string {
    let charlimit = 5;
    if (!text || text.length <= charlimit) {
      return text;
    }
    let without_html = text.replace(/<(?:.|\n)*?>/gm, '');
    let shortened = without_html.substring(0, charlimit) + '';
    return shortened;
  }
}

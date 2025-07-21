import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ContactListingCard } from '../contact-listing-card/contact-listing-card';
import { Contact } from '../../model/Contact';
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-contact-listing-month',
  standalone: true,
  imports: [ContactListingCard, MatDividerModule, DatePipe, NgFor],
  templateUrl: './contact-listing-month.html',
  styleUrl: './contact-listing-month.scss',
})
export class ContactListingMonth {
  @Input() contactList: Contact[] = [];
  @Input() contact!: Contact;
}

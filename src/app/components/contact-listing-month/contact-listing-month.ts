import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ContactListingCard } from "../contact-listing-card/contact-listing-card";

@Component({
  selector: 'app-contact-listing-month',
  imports: [ContactListingCard, MatDividerModule],
  templateUrl: './contact-listing-month.html',
  styleUrl: './contact-listing-month.scss'
})
export class ContactListingMonth {

}

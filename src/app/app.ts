import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { ContactData } from './services/contact-data';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Home,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  contactData: ContactData = inject(ContactData);
  protected title = 'sup-contact';
  constructor() {}
  ngOnInit(): void {
    this.contactData.open();
    // this.contactData.populateAgent();
    // this.contactData.populateMyCaseload();
    // this.contactData.populateOtherOffenders();
    // this.contactData.populateAllOffenders();
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactData } from './services/contact-data';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule
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

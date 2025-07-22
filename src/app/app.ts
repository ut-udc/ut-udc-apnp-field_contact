import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ContactData } from './services/contact-data';
import { HttpClient } from '@angular/common/http';
import { Home } from "./components/home/home";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    Home,
    CommonModule
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  contactData: ContactData = inject(ContactData);
  http: HttpClient = inject(HttpClient);
  protected title = 'sup-contact';
  constructor() {

  }
  ngOnInit(): void {
    if(!this.contactData.open()) {
      this.contactData.open();
      console.log('Populating Contact Database');
      this.contactData.populateAgent();
      this.contactData.populateMyCaseload();
      this.contactData.populateOtherOffenders();
      this.contactData.populateAllOffenders();
    }
  }
}

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ContactData } from './services/contact-data';
import { HttpClient } from '@angular/common/http';
import { Home } from './components/home/home';
import { CommonModule } from '@angular/common';
import { processContactQueue } from '../helpers';
import { Observable, Subscription } from 'rxjs';
import { NetworkService } from './services/network';
import { Agent } from './model/Agent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, Home, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  user: Agent | null = null;
  contactData: ContactData = inject(ContactData);
  http: HttpClient = inject(HttpClient);
  private networkSubscription!: Subscription;
  protected title = 'ut-udc-apnp-field_contact';
  isOnline: boolean = true;

  constructor(private networkService: NetworkService) {}

  async checkPopulationWithDexie(): Promise<boolean> {
    const count = await this.contactData.agents.count();
    return count > 0;
  }

  async ngOnInit(): Promise<void> {
    this.contactData.getUser().subscribe(user => {
      console.log('User from app line 36:', user);
      this.user = user;
    });
    this.networkSubscription = this.networkService.onlineStatus$.subscribe(
      (status) => {
        this.isOnline = status;
      }
    );
    let offender = await this.contactData.fetchData(
      'http://localhost:8080/field_contact_bff/api/offenders/70000'
    );



    await this.checkPopulationWithDexie().then((populated) => {
      if (!populated) {
        if (this.user !== null) {
          this.contactData.applicationUserName = this.user.userId;
        }
        this.contactData.open();
        console.log('Populating Contact Database');
        this.contactData.populateAgent();
        this.contactData.populateOfficers();
        this.contactData.populateMyCaseload();
        this.contactData.populateOtherOffenders();
        this.contactData.populateAllOffenders();
        this.contactData.populateLocations();
        this.contactData.populateContactTypes();
        //TO-DO find a better way of doing this
        window.location.reload();
      }
    });

    if (navigator.onLine) {
      await processContactQueue(this.contactData);
    }
    window.addEventListener('online', async () => {
      await processContactQueue(this.contactData);
    });
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
}

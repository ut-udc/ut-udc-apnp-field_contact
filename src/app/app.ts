import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ContactData } from './services/contact-data';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { processContactQueue } from '../helpers';
import { Observable, Subscription } from 'rxjs';
import { NetworkService } from './services/network';
import { Agent } from './model/Agent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  contactData: ContactData = inject(ContactData);
  http: HttpClient = inject(HttpClient);
  private networkSubscription!: Subscription;
  protected title = 'ut-udc-apnp-field_contact';
  isOnline: boolean = true;

  constructor() {}

  async checkPopulationWithDexie(): Promise<boolean> {
    var count = await this.contactData.agents.count();
    return count > 0;
  }

  async ngOnInit(): Promise<void> {

    await this.checkPopulationWithDexie().then((populated) => {
      if (!populated) {
        this.contactData.open();
        console.log('Populating Contact Database');
        this.contactData.populateAgent();

        console.log(
          'Number of agents in agents table: ' + this.contactData.agents.count()
        );
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

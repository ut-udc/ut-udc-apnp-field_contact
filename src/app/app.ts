import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LoadDataService} from './services/load-data-service';
import {ContactService} from './services/contact-service';
import {Db} from './services/db';
import {Subscription} from 'rxjs';
import {ApiService} from './services/api-service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  // template: '<app-home></app-home>',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private networkSubscription!: Subscription;
  loadDataService:LoadDataService = inject(LoadDataService);
  contactService:ContactService = inject(ContactService);
  apiService:ApiService = inject(ApiService);
  db:Db = inject(Db);

  protected readonly title = this.loadDataService.appTitle();


 constructor(    private iconRegistry: MatIconRegistry,
                 private sanitizer: DomSanitizer) {
   this.registerPhosphorIcons();
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', function () {
       navigator.serviceWorker.register('service-worker.js').then(
         function (registration) {
           console.log(
             'ServiceWorker registration successful with scope: ',
             registration.scope
           );
         },
         function (err) {
           console.log('ServiceWorker registration failed: ', err);
         }
       );
     });
   }
 }

  async ngOnInit(): Promise<void> {
    if (navigator.onLine) {
      for (let contact of await this.db.contacts.toArray()) {
        console.log('Syncing contact: ', contact);
        await this.contactService.syncContactWithDatabase(contact)
        await this.db.contactsQueue.delete(contact.contactId)
      }
      // await processContactQueue(this.apiService, this.contactService, this.db);
    }
    window.addEventListener('online', async () => {
      for (let contact of await this.db.contacts.toArray()) {
        console.log('Syncing contact online: ', contact);
      await this.contactService.syncContactWithDatabase(contact)
      }
      // await processContactQueue(this.apiService, this.contactService, this.db);
    });
  }

  ngOnDestroy(): void {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
  //*
  private registerPhosphorIcons(): void {
    const basePath = 'assets/phosphor-icons/';

    const icons = ['calendar', 'caret-down', 'clock'];

    icons.forEach(name => {
      this.iconRegistry.addSvgIcon(
        `ph-${name}`,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}${name}.svg`)
      );
    });
  }
  //*/
}

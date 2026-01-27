import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LoadDataService} from './services/load-data-service';
import {ContactService} from './services/contact-service';
import {Db} from './services/db';
import {Subscription} from 'rxjs';
import {ApiService} from './services/api-service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {AgentService} from './services/agent-service';
import {AppInitService} from './utils/app-init.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  // template: '<app-home></app-home>',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private networkSubscription!: Subscription;
  intervalMinutes: number = 3;
  refreshInterval: number = 1000 * 60 * this.intervalMinutes;
  loadDataService: LoadDataService = inject(LoadDataService);
  contactService: ContactService = inject(ContactService);
  agentService:AgentService = inject(AgentService);
  apiService:ApiService = inject(ApiService);
  db: Db = inject(Db);

  protected readonly title = this.loadDataService.appTitle();


  constructor(private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    inject(AppInitService).initFetchInterceptor();
    // if (Notification.permission === 'default') {
    //   Notification.requestPermission().then(permission => {
    //     if (permission === 'granted') {
    //       // User granted permission, now you can show notifications
    //     } else {
    //       // User denied permission
    //     }
    //   });
    // }
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
    const dataReload =  setInterval(() => {
      if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('./app.worker', import.meta.url));
        console.log('meta url ', import.meta.url);
        worker.onmessage = ({data}) => {
          console.log(`page got message: ${data}`);
        };
        worker.postMessage({'primaryAgentId': this.agentService.primaryAgent()?.userId, 'token': this.apiService.getCsrfToken()});
      } else {
        // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }
    }, this.refreshInterval)
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

    const icons = ['calendar', 'caret-down', 'caret-right', 'clock'];

    icons.forEach(name => {
      this.iconRegistry.addSvgIcon(
        `ph-${name}`,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}${name}.svg`)
      );
    });
  }

  //*/
}




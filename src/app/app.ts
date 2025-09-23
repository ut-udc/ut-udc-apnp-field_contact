import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LoadDataService} from './services/load-data-service';
import {processContactQueue} from '../helpers';
import {ContactService} from './services/contact-service';
import {Db} from './services/db';
import {Subscription} from 'rxjs';

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
  db:Db = inject(Db);

  protected readonly title = this.loadDataService.appTitle();

  async ngOnInit(): Promise<void> {
    if (navigator.onLine) {
      await processContactQueue(this.contactService, this.db);
    }
    window.addEventListener('online', async () => {
      await processContactQueue(this.contactService, this.db);
    });
  }

  ngOnDestroy(): void {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
}

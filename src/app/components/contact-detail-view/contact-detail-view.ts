import {Component, computed, effect, inject, inject as angularInject, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {from} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {Contact} from '../../models/contact';
import {AgentService} from '../../services/agent-service';
import {LocalStorageService} from '../../services/local-storage-service';

@Component({
  selector: 'app-contact-detail-view',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './contact-detail-view.html',
  styleUrl: './contact-detail-view.scss',
})
export class ContactDetailView {
  db: Db = inject(Db);
  agentService:AgentService = inject(AgentService);
  route: ActivatedRoute = inject(ActivatedRoute);
  contactId: number = Number(this.route.snapshot.params['contactId']);
  localStorageService:LocalStorageService = inject(LocalStorageService);

  locStorageContact:Contact | null = null;

  currentUnsyncedContact: Signal<Contact | undefined> = toSignal(from(
    liveQuery(() => this.db.contacts
      .get(Number(this.route.snapshot.params['contactId']))
    )));

  contactResultTypeById: Signal<string> = computed(() => {
    if (this.locStorageContact) {
      return this.agentService.allContactResultTypes()?.find(typ => typ.id === this.locStorageContact?.result)?.text.trim() ?? '';
    } else {
      return this.agentService.allContactResultTypes()?.find(typ => typ.id === this.locStorageContact?.result)?.text.trim() ?? '';
    }
  });

  constructor() {

    effect(async () => {
      if (!this.currentUnsyncedContact()) {
        this.currentUnsyncedContact = toSignal(from(
         this.db.contacts
            .get(this.contactId)
          ));
        console.log('ContactDetailView', this.currentUnsyncedContact());
      }
    })

    this.locStorageContact = JSON.parse(this.localStorageService.getItem(this.contactId.toString())) as Contact;
    console.log('Local Storage Contact: ', this.locStorageContact);
    const iconRegistry = angularInject(MatIconRegistry);
    const sanitizer = angularInject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }

  truncateTimeString(text: string): string {
    let charlimit = 5;
    if (!text || text.length <= charlimit) {
      return text;
    }
    let without_html = text.replace(/<(?:.|\n)*?>/gm, '');
    return without_html.substring(0, charlimit);
  }
}

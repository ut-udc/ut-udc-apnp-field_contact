import {Component, effect, inject, inject as angularInject, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {from} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {Contact} from '../../models/contact';
import {Agent} from '../../models/agent';

@Component({
  selector: 'app-contact-detail-view',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './contact-detail-view.html',
  styleUrl: './contact-detail-view.scss',
})
export class ContactDetailView {
  db: Db = inject(Db);
  route: ActivatedRoute = inject(ActivatedRoute);
  contactId: number = Number(this.route.snapshot.params['contactId']);

  currentContact: Signal<Contact | undefined> = toSignal(from(
    liveQuery(() => this.db.existingContacts
      .get(Number(this.route.snapshot.params['contactId']))
    )));

  primaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .get(this.currentContact()!.primaryInterviewer?.trim())
    )));

  secondaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .get(this.currentContact()!.primaryInterviewer?.trim())
    )));

  constructor() {

    effect(async () => {
      if (!this.currentContact()) {
        this.currentContact = toSignal(from(
          liveQuery(() => this.db.existingContacts
            .get(this.contactId)
          )));
        console.log('ContactDetailView', this.currentContact());
      }
    })
    effect(async () => {
      if (!this.primaryInterviewer()) {
        this.primaryInterviewer = toSignal(from(
          liveQuery(() => this.db.agents
            .where('userId')
            .equals(this.currentContact()!.primaryInterviewer?.trim())
            .first()
          )));
        console.log('primary ', this.primaryInterviewer());
      }
    })
    effect(async () => {
      if (!this.secondaryInterviewer()) {
        this.secondaryInterviewer = toSignal(from(
          liveQuery(() => this.db.agents
            .where('userId')
            .equals(this.currentContact()!.secondaryInterviewer?.trim())
            .first()
          )));
        console.log('secondary ', this.secondaryInterviewer());
      }
    })

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
    let shortened = without_html.substring(0, charlimit) + '';
    return shortened;
  }
}

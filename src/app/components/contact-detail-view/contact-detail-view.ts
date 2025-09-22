import {Component, inject, inject as angularInject, Signal} from '@angular/core';
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
  db:Db = inject(Db);
  route: ActivatedRoute = inject(ActivatedRoute);

  currentContact: Signal<Contact | undefined> = toSignal(from(
    liveQuery(() => this.db.existingContacts
      .where('contactId')
      .equals(Number(this.route.snapshot.params['contactId']))
      .first()))
  );


  primaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('userId')
      .equals(this.currentContact()!.primaryInterviewer)
      .first()))
  );

  secondaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('userId')
      .equals(this.currentContact()!.primaryInterviewer)
      .first()))
  );

  constructor() {
    const iconRegistry = angularInject(MatIconRegistry);
    const sanitizer = angularInject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }
}

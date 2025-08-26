import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { inject as angularInject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ContactData } from '../../services/contact-data';
import { Navigation } from '../../services/navigation';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Contact } from '../../model/Contact';
import { Agent } from '../../model/Agent';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-detail-view',
  imports: [CommonModule, MatIconModule, RouterLink, NgIf],
  templateUrl: './contact-detail-view.html',
  styleUrl: './contact-detail-view.scss',
})
export class ContactDetailView {
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);
  route: ActivatedRoute = inject(ActivatedRoute);

  currentContact = new Observable<Contact>((observer) => {
    this.contactData
      .getContactById(Number(this.route.snapshot.params['contactId']))
      .then((contact) => {
        if (contact) {
          observer.next(contact);
          console.log('Current Contact line 28:', contact);
        } else {
          observer.next({} as Contact);
        }
      });
  });
  primaryAgent = new Observable<Agent>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData.getOfficerById(contact.agentId).then((agent) => {
        if (agent) {
          observer.next(agent);
        } else {
          observer.next({} as Agent);
        }
      });
    });
  });
  secondaryAgent = new Observable<Agent>((observer) => {
    this.currentContact.subscribe((contact) => {
      this.contactData
        .getOfficerById(contact.secondaryAgentId)
        .then((agent) => {
          if (agent) {
            observer.next(agent);
          } else {
            observer.next({} as Agent);
          }
        });
    });
  });

  constructor() {
    const iconRegistry = angularInject(MatIconRegistry);
    const sanitizer = angularInject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }
}

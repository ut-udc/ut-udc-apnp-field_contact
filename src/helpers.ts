import {OffenderBase} from './app/models/offender-base';
import {Contact} from './app/models/contact';
import {inject} from '@angular/core';
import {ContactService} from './app/services/contact-service';
import {Db} from './app/services/db';


export const addToContactQueue = (
  contact: Contact,
  contactService:ContactService = inject(ContactService),
  method: string
) => {
  if (method === 'PUT') {
    contactService.addPostContactToQueue(contact);
  }
  // else if (method === 'PUT') {
  //   contactService.addUpdateContactToQueue(contact);
  // } else if (method === 'DELETE') {
  //   contactService.addDeleteContactToQueue(contact);
  // }
};

export const addOffendersToOtherOffenders = (
  baseOffenders: OffenderBase[],
  contactService:ContactService = inject(ContactService),
) => {
  if (!navigator.onLine) {
    baseOffenders.forEach(async (offender) => {
      await contactService.addOffenderToOtherOffenders(offender);
    });
  } else {
    baseOffenders.forEach(async (offender) => {
      return fetch(
        'http://localhost:3000/getOffenderToOtherOffenders?offenderNumber=' +
          offender.offenderNumber,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          contactService.addOffenderToOtherOffenders(data);
          return data;
        })
        .catch((error) => {
          console.error('Error adding other offender data:', error);
          return;
        });
    });
  }
};

export const removeOffendersFromOtherOffenders = (
  offenders: OffenderBase[],
  contactService:ContactService = inject(ContactService),
) => {
  offenders.forEach(async (offender) => {
    await contactService.removeOffenderFromOtherOffenders(offender);
  });
};

export const processContactQueue = async (contactService:ContactService, db:Db) => {
  if (!navigator.onLine) {
    return;
  }

  // const queuedContacts = await this.db.contactsQueue.toArray();
  if (contactService.queuedContacts()?.length === 0) {
    return;
  }
  while ((contactService.queuedContacts()?.length ?? 0) > 0) {
    if (!navigator.onLine) {
      return;
    }
    let successful = false;
    const queuedContact = contactService.queuedContacts()?.[0];
    try {
      await fetch(queuedContact!.url, {
        method: queuedContact!.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: queuedContact!.body ? JSON.stringify(queuedContact!.body) : null,
      })
        .then((response) => {
          if (!response.ok) {
            return null;
          }
          return response.json();
        })
        .then((data: Contact) => {
          if (data) {
            data.contactSyncedWithDatabase = true;
            successful = data.contactSyncedWithDatabase;
            //TODO update this to only update the contact ID and insert that into existing contacts store.
            db.contacts.add(data);
            return data;
          }
          return null;
        });
      if (typeof queuedContact?.id === 'number' && successful) {
        await db.contactsQueue.delete(queuedContact.id);
      }
    } catch (error) {
      console.error('Error inserting data:', error);
      break;
    }
  }
};

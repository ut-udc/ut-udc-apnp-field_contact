import { ContactData } from './app/services/contact-data';
import { OffenderBase } from './app/model/OffenderBase';
import { Offender } from './app/model/Offender';
import { Agent } from './app/model/Agent';
import { Contact } from './app/model/Contact';

export const fetchMyCaseload = async (contactData?: ContactData) => {
  if (!navigator.onLine) {
    const myCaseload = contactData
      ? (await contactData.getMyCaseload()) || []
      : [];
    return Promise.resolve(myCaseload);
  }
  return fetch(
    'http://localhost:3000/agentId=' + contactData?.applicationUserName
  )
    .then((response) => response.json())
    .then((data) => {
      const myCaseload = data;
      return myCaseload;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      throw error;
    });
};

export const fetchAllOffenders = async (contactData?: ContactData) => {
  if (!navigator.onLine) {
    const otherOffenders = contactData
      ? (await contactData.getOtherOffenders()) || []
      : [];
    return Promise.resolve(otherOffenders);
  }
  return fetch('http://localhost:3000/allApnpOffenders')
    .then((response) => response.json())
    .then((data) => {
      const otherOffenders = data;
      return otherOffenders;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      throw error;
    });
};

export const addContacts = async (
  contacts: Contact[],
  contactData: ContactData
) => {
  if (!navigator.onLine) {
    for (const contact of contacts) {
      await contactData.addPostContactToQueue(contact);
    }
    return Promise.resolve(true);
  } else {
    return fetch('http://localhost:3000/addContacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contacts),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error('Error inserting data:', error);
        throw error;
      });
  }
};

export const addToContactQueue = (
  contact: Contact,
  contactData: ContactData,
  method: string
) => {
  if (method === 'POST') {
    contactData.addPostContactToQueue(contact);
  } else if (method === 'PUT') {
    contactData.addUpdateContactToQueue(contact);
  } else if (method === 'DELETE') {
    contactData.addDeleteContactToQueue(contact);
  }
};

export const addOffendersToOtherOffenders = (
  baseOffenders: OffenderBase[],
  contactData: ContactData
) => {
  if (!navigator.onLine) {
    baseOffenders.forEach(async (offender) => {
      await contactData.addOffenderToOtherOffenders(offender);
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
          contactData.addOffenderToOtherOffenders(data);
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
  contactData: ContactData
) => {
  offenders.forEach(async (offender) => {
    await contactData.removeOffenderFromOtherOffenders(offender);
  });
};

export const processContactQueue = async (contactData: ContactData) => {
  if (!navigator.onLine) {
    return;
  }
  const queuedContacts = await contactData.contactsQueue.toArray();
  if (queuedContacts.length === 0) {
    return;
  }
  while (queuedContacts.length > 0) {
    if (!navigator.onLine) {
      return;
    }
    let successful = false;
    const queuedContact = queuedContacts[0];
    try {
      await fetch(queuedContact.url, {
        method: queuedContact.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: queuedContact.body ? JSON.stringify(queuedContact.body) : null,
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
            contactData.contacts.add(data);
            return data;
          }
          return null;
        });
      if (typeof queuedContact.id === 'number' && successful) {
        await contactData.contactsQueue.delete(queuedContact.id);
      }
    } catch (error) {
      console.error('Error inserting data:', error);
      break;
    }
  }
};

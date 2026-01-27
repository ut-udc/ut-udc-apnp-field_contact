/// <reference lib="webworker" />

import {Offender} from './models/offender';
import {Db} from './services/db';
import {Contact} from './models/contact';

const db: Db = new Db();

self.onmessage = async function (event) {
  console.log('Worker received message: ', event.data);

  await db.open();

  // const db = await new Dexie('supervisionContactsDB').open();
  // Prevent fetch call if primaryAgentId is undefined or null
  if(!event.data?.primaryAgentId) return;
  const response = await fetch('/field_contact_bff/api/agent-caseload/' + event.data?.primaryAgentId);
  let offenders: Array<Offender> = await response.json();
  // Clear existing data only after confirming offenders response is valid
  if(!offenders) {
    return;
  }
  console.log(offenders.length + ' offenders fetched in worker');
  // clearing old data
  await db.caseload.clear();
  await db.existingContacts.clear();

  // Switched from bulkAdd to bulkPut to safely upsert records and avoid duplicate key errors
  await db.caseload.bulkPut(offenders, {allKeys: true});
  for (const offender of offenders) {
    // Skip processing when offender or offenderNumber is missing
    if(!offender || !offender.offenderNumber) continue;
    console.log(offender.offenderNumber + ' offenderNumber processing in worker');
    console.log('localhost:8080/field_contact_bff/api/existing-contacts/' + offender.offenderNumber);
    const contactsResponse = await fetch('/field_contact_bff/api/existing-contacts/' + offender.offenderNumber);
    let contacts: Array<Contact> = await contactsResponse.json();
    console.log(contacts.length + ' contacts fetched in worker');
    // Switched from bulkAdd to bulkPut to safely upsert records and avoid duplicate key errors
    await db.existingContacts.bulkPut(contacts);
    const contactIds: Array<number> = [];
    for (const contact of contacts) {
      contactIds.push(contact.contactId);
    }
    await loadSummaries(contactIds, event.data?.token);
  }
}

async function loadSummaries(contactIds: number[], token: string) {
  try {
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({contactIds}),
    };

    const response = await protectedFetch(`/field_contact_bff/api/existing-contact-summaries`, options, token);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const summaries: Contact[] = await response.json();

    for (const s of summaries) {
      await db.existingContacts.update(s.contactId, {summary: s.summary});
      console.log('Updated summary for contact ID:', s.contactId);
    }
  } catch (error) {
    console.error(`Unable to get summaries for ${contactIds}:`, error);
  }
}

function getCsrfToken(): string | null {
  const cookieName = 'XSRF-TOKEN=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(cookieName)) {
      // Decode the cookie value in case it's URL-encoded
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return null;
}

async function protectedFetch(url: string, options: RequestInit = {}, token: string): Promise<Response> {
  // const token = getCsrfToken();

  // 1. Create a new Headers object, safely initializing it from the provided headers.
  // The Headers constructor correctly handles all valid formats (Headers, object, or array).
  const newHeaders = new Headers(options.headers);

  // 2. Add the CSRF token to the new headers object if it exists.
  if (token) {
    newHeaders.set('X-XSRF-TOKEN', token);
  }

  // 3. Set content type if a body is present and no content type is already set.
  if (options.body && !newHeaders.has('Content-Type')) {
    newHeaders.set('Content-Type', 'application/json');
  }

// 4. Create a new options object to avoid mutating the original.
// Spread the original options and then override the headers property.
  const newOptions: RequestInit = {
    ...options,
    headers: newHeaders,
  };

  return fetch(url, newOptions);
}

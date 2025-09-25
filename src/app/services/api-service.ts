import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  path = '/field_contact_bff/api';
  testPath = '/field_contact_bff/api/handshake'

  constructor() {
    this.performHandshake();
  }

  private async performHandshake(): Promise<void> {
    try {
      console.log("testPath = " + this.testPath);
      await fetch(this.testPath,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      console.log('CSRF handshake successful.');
    } catch (error) {
      console.error('CSRF handshake failed:', error);
    }
  }

  private getCsrfToken(): string | null {
    const cookieName = 'XSRF-TOKEN=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(cookieName)) {
        console.log("HERE =====> " + cookie);
        // Decode the cookie value in case it's URL-encoded
        return decodeURIComponent(cookie.substring(cookieName.length));
      }
    }
    return null;
  }

  async protectedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getCsrfToken();
    console.log("token = " + token)

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


}

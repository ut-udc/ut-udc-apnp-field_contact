import { Injectable, inject } from '@angular/core';
import {ErrorHandlerService} from './http-error-handler';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  private errorHandler = inject(ErrorHandlerService);

  initFetchInterceptor(): void {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const response = await originalFetch(input, init);

      if (!url.includes('/api/handshake') && !response.ok) {
        await this.errorHandler.handleHttpError(response);
      }

      return response;
    };
  }
}

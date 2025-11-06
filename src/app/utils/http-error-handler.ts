import { Injectable, inject } from '@angular/core';
import {SnackBarService} from '../services/snack-bar-service';
const repeated500ErrHandling:any = {count:0, lastOccurred: null, snackBarShown: false};
function getSecondsDiff(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / 1000);
}
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  snackBarService: SnackBarService = inject(SnackBarService);
  handleHttpError(response: Response): never {
    let message = '';

    // ✅ Get base href from <base href="..."> tag
    const baseHref =
      document.querySelector('base')?.getAttribute('href')?.replace(/\/?$/, '/') || '/';

    const redirect = (path: string) => {
      // Ensures no duplicate slashes
      const url = new URL(path.replace(/^\/+/, ''), window.location.origin + baseHref).toString();
      window.location.href = url;
    };

    switch (response.status) {
      case 400:
        message = 'Bad Request – please check your input.';
        break;
      case 401:
        message = 'Unauthorized – please log in again.';
        redirect('/401');
        break;
      case 403:
        message = 'Forbidden – you do not have access.';
        redirect('/403');
        break;
      case 404:
        message = 'Resource not found.';
        redirect('/404');
        break;
      case 500:
        message = 'Internal Server Error – please try later.';
        if(repeated500ErrHandling.lastOccurred == null) {
          repeated500ErrHandling.lastOccurred = new Date();
        }
        if(!repeated500ErrHandling.snackBarShown && getSecondsDiff(new Date(), repeated500ErrHandling.lastOccurred)<=5) {
          repeated500ErrHandling.count++;
          if( repeated500ErrHandling.count >= 5) {
            repeated500ErrHandling.snackBarShown = true;
            this.snackBarService.show('We ran into a problem processing your request. Please try again in a moment.', -1);
          } else {
            repeated500ErrHandling.lastOccurred = new Date();
          }
        }
        // redirect('/500');
        break;
      default:
        message = `Unexpected error (${response.status}): ${response.statusText}`;
    }

    console.error(`[Fetch Error ${response.status}] ${message}`);
    throw new Error(message);
  }

}









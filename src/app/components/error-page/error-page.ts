import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {SnackBarService} from '../../services/snack-bar-service';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error-page',
  imports: [
    MatButton,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss'
})
export class ErrorPage implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private titleService = inject(Title);
  snackBarService: SnackBarService = inject(SnackBarService);
  title = signal('');
  message = signal('');
  errorCode = signal('');
  shortMsg = signal('');
  showSignIn = signal(false);
  showGoBack = signal(false);
  showReportTheIssue = signal(false);
  showTryAgain = signal(false);

  ngOnInit() {
    this.noData();
  }
  noData() {
    this.title.set('');
    this.message.set('');
    this.errorCode.set('');
    this.shortMsg.set('');
    this.showSignIn.set(false);
    this.showGoBack.set(false);
    this.showReportTheIssue.set(false);
    this.showTryAgain.set(false);
  }
  constructor() {
    this.noData();
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
    effect(() => {
      this.noData();
      const url = this.router.url;
      this.updateErrorPage(url);
    });
  }

  private updateErrorPage(url: string) {
    // Extract numeric code if URL like /401 or /403
    let code = '404';
    const path = url.split('?')[0]; // remove query parameters

    if (path.endsWith('/401')) {
      code = '401';
    } else if (path.endsWith('/403')) {
      code = '403';
    } else if (path.endsWith('/500')) {
      code = '500';
    }
    switch (code) {
      case '401':
        this.title.set('Access Restricted');
        this.message.set('You don’t have permission to view this page. You must sign in to access this page.');
        this.errorCode.set('401');
        this.shortMsg.set('Access Restricted');
        this.showSignIn.set(true);
        this.showGoBack.set(false);
        this.showReportTheIssue.set(false);
        this.showTryAgain.set(false);
        break;
      case '400':
        this.title.set('Bad Request');
        this.message.set('The request could not be processed due to invalid or missing information. Please verify your input and try again, or contact your administrator if the issue persists.');
        this.errorCode.set('400');
        this.shortMsg.set('Bad Request');
        this.showSignIn.set(false);
        this.showGoBack.set(true);
        this.showReportTheIssue.set(true);
        this.showTryAgain.set(false);
        break;
      case '403':
        this.title.set('Forbidden Access');
        this.message.set('You don’t have permission to view this page. Request access or report the issue to your administrator if you believe this is an error.');
        this.errorCode.set('403');
        this.shortMsg.set('Forbidden Access');
        this.showSignIn.set(false);
        this.showGoBack.set(true);
        this.showReportTheIssue.set(true);
        this.showTryAgain.set(false);
        break;

      case '500':
        this.title.set('Something went wrong');
        this.message.set('We ran into a problem processing your request. Please try again in a moment.');
        this.errorCode.set('500');
        this.shortMsg.set('Internal Server Error');
        this.showSignIn.set(false);
        this.showGoBack.set(true);
        this.showReportTheIssue.set(true);
        this.showTryAgain.set(false);
        break;

      default:
        this.title.set('Not Found');
        this.message.set('We could not find the resource you’re looking for. It may have been moved or broken.');
        this.errorCode.set('404');
        this.shortMsg.set('Not Found');
        this.showSignIn.set(false);
        this.showGoBack.set(true);
        this.showReportTheIssue.set(true);
        this.showTryAgain.set(false);

    }

    this.titleService.setTitle(this.title());
  }
  goBack() {
      if (this.errorCode() == '401') {
                this.router.navigate(['/home']);
      } else if (this.errorCode() == '404') {
        this.router.navigate(['/home']);
      } else if (this.errorCode() == '403') {
        this.router.navigate(['/home']);
      } else if (this.errorCode() == '500') {
        this.router.navigate(['/home']);
      } else {
        this.locationBack();
      }
  }
  locationBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Fallback route when no history exists
      this.router.navigate(['/home']); // or any route you prefer
    }
  }
  snackBarTest() {
    this.snackBarService.show("Snack Bar 1 !!!");
    this.snackBarService.show("Snack Bar 2 !!!");
    this.snackBarService.show("Snack Bar Opened Successfully !!! Are you sure you want to submit? Are you sure you want to submit?");
  }
  tryAgain() {
    this.snackBarService.show("Try again clicked.")
  }
}

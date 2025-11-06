import { Component, Inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import {SnackBarService} from '../../services/snack-bar-service';

@Component({
  selector: 'app-stacked-snack-bar',
  templateUrl: './stacked-snack-bar.html',
  styleUrl: './stacked-snack-bar.scss',
})
export class StackedSnackBar {
  constructor(
    @Inject('SNACKBAR_MESSAGE') public message: string,
    @Inject('SNACKBAR_DURATION') public duration: number,
    @Inject('SNACKBAR_REF') private overlayRef: OverlayRef,
    private snackBarService: SnackBarService
  ) {}

  /** Closes this snackbar and triggers restacking in the service */
  close(): void {
    this.snackBarService.dismiss(this.overlayRef);
  }
}


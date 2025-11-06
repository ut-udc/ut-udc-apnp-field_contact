// common-dialog.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {CommonDialogComponent, CommonDialogData} from '../components/common-dialog/common-dialog';

@Injectable({ providedIn: 'root' })
export class CommonDialogService {
  constructor(private dialog: MatDialog) {}
  openConfirmDialog() {
    return this.openDialog({
      title: 'Confirmation',
      message: 'Are you sure you want to submit?',
      actionText: 'OK',
      showCancel: true
    });
  }
  open500TryAgainDialog() {
    return this.openDialog({
      title: 'Something went wrong',
      message: 'We ran into a problem processing your request. Please try again in a moment.',
      actionText: 'Try Again',
      showCancel: true
    });
  }
  openDialog(data: CommonDialogData) {
    return this.dialog.open(CommonDialogComponent, {
      width: '400px',
      data,
      disableClose: true // Optional: prevent closing by clicking outside
    }).afterClosed(); // returns Observable<boolean>
  }
}

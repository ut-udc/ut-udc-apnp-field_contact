import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {CommonModule} from '@angular/common';

export interface CommonDialogData {
  title: string;
  message: string;
  actionText?: string; // Optional button text
  showCancel?: boolean; // Show cancel button if needed
}

@Component({
  selector: 'app-common-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './common-dialog.html',
  styleUrls: ['./common-dialog.scss']
})
export class CommonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommonDialogData
  ) {}

  onAction(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

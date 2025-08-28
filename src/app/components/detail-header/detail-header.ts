import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContactData } from '../../services/contact-data';
import { NetworkService } from '../../services/network';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-header',
  imports: [MatIconModule, RouterLink],
  templateUrl: './detail-header.html',
  styleUrl: './detail-header.scss',
})
export class DetailHeader implements OnInit {
  @Input() title: string = '';
  @Input() backLink: string = '';
  contactData: ContactData = inject(ContactData);
  isOnline: boolean = true;
  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(FieldVisitGuidelinesBottomSheet);
  }

  constructor(private networkService: NetworkService) {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }

  ngOnInit(): void {
    this.networkService.onlineStatus$.subscribe((status) => {
      this.isOnline = status;
    });
    console.log('Is Online?:' + this.contactData.isOnline);
  }
}
@Component({
  selector: 'offline-mode-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './offline-mode-bottom-sheet.html',
  styleUrl: './offline-mode-bottom-sheet.scss',
})
export class FieldVisitGuidelinesBottomSheet {
  private _bottomSheetRef: MatBottomSheetRef<FieldVisitGuidelinesBottomSheet> =
    inject(MatBottomSheetRef<FieldVisitGuidelinesBottomSheet>);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
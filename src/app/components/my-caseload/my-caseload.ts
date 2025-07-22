import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OffenderCard } from '../offender-card/offender-card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Offender } from '../../model/Offender';

@Component({
  selector: 'app-my-caseload',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    OffenderCard,
  ],
  templateUrl: './my-caseload.html',
  styleUrl: './my-caseload.scss',
})
export class MyCaseload implements OnInit {
  @Input() myCaseload: Offender[] = [];

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/filter.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/search.svg')
    );
  }
  ngOnInit(): void {
    console.log(this.myCaseload);
  }
}

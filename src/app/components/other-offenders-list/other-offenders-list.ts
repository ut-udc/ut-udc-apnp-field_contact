import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OffenderCard } from '../offender-card/offender-card';
import { Offender } from '../../model/Offender';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { ContactData } from '../../services/contact-data';

@Component({
  selector: 'app-other-offenders-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule, OffenderCard],
  templateUrl: './other-offenders-list.html',
  styleUrl: './other-offenders-list.scss',
})
export class OtherOffendersList implements OnInit {
  otherOffenders: Observable<Offender[]> = new Observable<Offender[]>();
  contactData: ContactData = inject(ContactData);

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
  async loadOtherOffenders(): Promise<void> {
    this.otherOffenders = of(await this.contactData.getOtherOffenders());
  }

  ngOnInit(): void {
    this.loadOtherOffenders();
    console.log(this.otherOffenders);
  }
}

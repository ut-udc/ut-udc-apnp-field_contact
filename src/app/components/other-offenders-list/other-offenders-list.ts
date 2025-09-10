import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OffenderCard } from '../offender-card/offender-card';
import { Offender } from '../../model/Offender';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { ContactData } from '../../services/contact-data';
import { RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-other-offenders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    OffenderCard,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './other-offenders-list.html',
  styleUrl: './other-offenders-list.scss',
})
export class OtherOffendersList implements OnInit {
  otherOffenders: BehaviorSubject<Offender[]> = new BehaviorSubject<Offender[]>(
    []
  );
  caseload: Offender[] = [];
  contactData: ContactData = inject(ContactData);



  searchForm: FormGroup = new FormGroup({
    searchTerm: new FormControl<string | null>(null),
  });

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    this.loadOtherOffenders();
    

    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
    iconRegistry.addSvgIcon(
      'add-black',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-black.svg')
    );
  }
  async loadOtherOffenders(): Promise<void> {
    this.otherOffenders.next(await this.contactData.getOtherOffenders());
  }

  ngOnInit(): void {}

  filterCaseloadByFirstAndLastNames(searchTerm: string): void {
    console.log('searchTerm: ' + searchTerm);
    if (!searchTerm) {
      this.loadOtherOffenders();
      console.log('this.caseload: ');
      return;
    } else {
      console.log('this.caseload111: ');
      this.otherOffenders.subscribe((offenders) => {
        this.caseload = offenders.filter((offender) => {
          const fullName =
            `${offender.defaultOffenderName.firstName} ${offender.defaultOffenderName.lastName}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        });
      });
      this.otherOffenders.next(this.caseload);
    }
  }
}

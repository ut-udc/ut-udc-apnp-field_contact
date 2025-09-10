import { Component, inject, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OffenderCard } from '../offender-card/offender-card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Offender } from '../../model/Offender';
import { BehaviorSubject } from 'rxjs';
import { ContactData } from '../../services/contact-data';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-my-caseload',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    OffenderCard,
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './my-caseload.html',
  styleUrl: './my-caseload.scss',
})
export class MyCaseload implements OnInit {
  myCaseload: BehaviorSubject<Offender[]> = new BehaviorSubject<Offender[]>([]);
  caseload: Offender[] = [];
  contactData: ContactData = inject(ContactData);
  searchForm: FormGroup = new FormGroup({
    searchTerm: new FormControl<string | null>(null),
  });

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    this.loadMyCaseload();

    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
  }
  loadMyCaseload(): void {
    this.contactData.getMyCaseload().then((offenders) => {
      console.log('My Caseload line 57:', offenders);
      this.myCaseload.next(offenders);
    });
  }
  ngOnInit(): void {}

  // To filter the caseload, subscribe to the observable and filter the result
  filterCaseload(searchTerm: string): void {
    this.myCaseload.subscribe((offenders) => {
      this.caseload = offenders.filter((offender) =>
        offender.defaultOffenderName.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }
  filterCaseloadByOffenderInformation(searchTerm: string): void {
    console.log('searchTerm: ' + searchTerm);
    if (!searchTerm) {
      this.loadMyCaseload();
      console.log('this.caseload: ');
      return;
    } else {
      console.log('this.caseload111: ');
      this.myCaseload.subscribe((offenders) => {
        this.caseload = offenders.filter((offender) => {
          const fullName =
            `${offender.defaultOffenderName.firstName} ${offender.defaultOffenderName.lastName} ${offender.offenderNumber} ${offender.birthDate} ${offender.address} ${offender.city} ${offender.state} ${offender.zip} ${offender.phone}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        });
      });
      this.myCaseload.next(this.caseload);
    }
  }
  resetSearch(): void {
    this.searchForm.reset();
    this.loadMyCaseload();
  }
}

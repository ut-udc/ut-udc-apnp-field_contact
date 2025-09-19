import {Component, inject, Input, OnInit, Signal} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OffenderCard } from '../offender-card/offender-card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Offender } from '../../models/offender';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {from} from 'rxjs';

@Component({
  selector: 'app-my-caseload',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    OffenderCard,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './my-caseload.html',
  styleUrl: './my-caseload.scss',
})
export class MyCaseload implements OnInit {
  db:Db = inject(Db);
  searchForm: FormGroup = new FormGroup({
    searchTerm: new FormControl<string | null>(null),
  });

  myCaseload: Signal<Array<Offender> | undefined> = toSignal(from(
  liveQuery(async ()=> this.db.caseload.toArray()))
);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
  }
  ngOnInit(): void {}

  addressString: string = '';
  filterCaseloadByOffenderInformation(searchTerm: string): void {
    console.log('searchTerm: ' + searchTerm);
    if (!searchTerm) {
      this.myCaseload();
      return;
    } else {
      this.myCaseload()?.filter((offender:Offender) => {

          if (offender.offenderAddress) {
            var lineOne = offender.offenderAddress.lineOne ? offender.offenderAddress.lineOne : '';
            var lineTwo = offender.offenderAddress.lineTwo ? offender.offenderAddress.lineTwo : '';
            var city = offender.offenderAddress.city ? offender.offenderAddress.city : '';
            var state = offender.offenderAddress.state ? offender.offenderAddress.state : '';
            var zipCode = offender.offenderAddress.zipCode ? offender.offenderAddress.zipCode : '';
            this.addressString = `${lineOne} ${lineTwo} ${city} ${state} ${zipCode}`.toLowerCase();
          }
          const fullName =
            `${offender.defaultOffenderName.firstName} ${offender.defaultOffenderName.lastName} ${offender.offenderNumber} ${offender.birthDate} ${this.addressString} ${offender.phone}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
      }
  }
  resetSearch(): void {
    this.searchForm.reset();
  }
}

import {Component, computed, inject, OnInit, Signal, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {OffenderCard} from '../offender-card/offender-card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {DomSanitizer} from '@angular/platform-browser';
import {Offender} from '../../models/offender';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Db} from '../../services/db';
import {AgentService} from '../../services/agent-service';
import {UserService} from '../../services/user-service';

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
    FormsModule,
  ],
  templateUrl: './my-caseload.html',
  styleUrl: './my-caseload.scss',
})
export class MyCaseload implements OnInit {
  db:Db = inject(Db);
  agentService:AgentService = inject(AgentService);
  userService:UserService = inject(UserService);

  proxyAgentName: Signal<string> = computed(() => {
    if (this.agentService.primaryAgent()?.userId && !this.userService.user()?.userId){
      return this.agentService.primaryAgent()?.name.trim() +  '\'s' ;
    } else {
      return 'My ';
    }
  });

  searchForm: FormGroup = new FormGroup({
    searchTerm: new FormControl<string | null>(null),
  });

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
  phone: string = '';
  birthdate: string = '';
  filterCaseloadByOffenderInformation(searchTerm: string): void {
    console.log('searchTerm: ' + searchTerm);
    if (!searchTerm) {
      this.agentService.myCaseload();
      return;
    } else {
      this.agentService.myCaseload()?.filter((offender:Offender) => {

          if (offender.offenderAddress) {
            var lineOne = offender.offenderAddress.lineOne ? offender.offenderAddress.lineOne : '';
            var lineTwo = offender.offenderAddress.lineTwo ? offender.offenderAddress.lineTwo : '';
            var city = offender.offenderAddress.city ? offender.offenderAddress.city : '';
            var state = offender.offenderAddress.state ? offender.offenderAddress.state : '';
            var zipCode = offender.offenderAddress.zipCode ? offender.offenderAddress.zipCode : '';
            this.addressString = `${lineOne} ${lineTwo} ${city} ${state} ${zipCode}`.toLowerCase();
          }
          this.phone = offender.defaultPhoneNumber ? offender.defaultPhoneNumber : '';

          const fullName =
            `${offender.defaultOffenderName.firstName} ${offender.defaultOffenderName.lastName} ${offender.offenderNumber} ${offender.birthDate} ? ${offender.birthDate} : '' ${this.addressString} `.toLowerCase();
          console.log('Search String: '+fullName);
          return fullName.includes(searchTerm.toLowerCase());
        });
      }
  }

  searchTerm = signal<string>('');

  filteredItems = computed(() => {
    const searchTerm = this.searchTerm()?.toLowerCase();
    if (!searchTerm) {
      return this.agentService.myCaseload();
    } else {
      return this.agentService.myCaseload()?.filter((offender:Offender) => {

        if (offender.offenderAddress) {
          var lineOne = offender.offenderAddress.lineOne ? offender.offenderAddress.lineOne : '';
          var lineTwo = offender.offenderAddress.lineTwo ? offender.offenderAddress.lineTwo : '';
          var city = offender.offenderAddress.city ? offender.offenderAddress.city : '';
          var state = offender.offenderAddress.state ? offender.offenderAddress.state : '';
          var zipCode = offender.offenderAddress.zipCode ? offender.offenderAddress.zipCode : '';
          this.addressString = `${lineOne} ${lineTwo} ${city} ${state} ${zipCode}`.toLowerCase();
        }
        this.phone = offender.defaultPhoneNumber ? offender.defaultPhoneNumber : '';
        this.birthdate = offender.birthDate?.toString() ? offender.birthDate?.toString() : '';

        const fullName =
          `${offender.defaultOffenderName.firstName} ${offender.defaultOffenderName.lastName} ${offender.offenderNumber} ${offender.defaultDob} ${this.phone} ${this.birthdate} ${this.addressString} `.toLowerCase();
        console.log('Search String: '+fullName);
        return fullName.includes(searchTerm);
      });
    }
  });

  resetSearch(): void {
    this.searchTerm.set('');
    this.searchForm.reset();
  }
}

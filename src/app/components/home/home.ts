import {Component, inject, OnInit, Signal} from '@angular/core';
import {UserService} from '../../services/user-service';
import {AgentService} from '../../services/agent-service';
import {MyCaseload} from '../my-caseload/my-caseload';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ProxyUserSelect} from '../proxy-user-select/proxy-user-select';
import {environment} from '../../../environments/environment';
import {RouterLink} from '@angular/router';
import {Contact} from '../../models/contact';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {MatBadge} from '@angular/material/badge';

@Component({
  selector: 'app-home',
  imports: [
    MyCaseload,
    MatToolbarRow,
    MatIconModule,
    RouterLink,
    MatToolbar,
    ProxyUserSelect,
    MatBadge
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements  OnInit {
  userService = inject(UserService);
  agentService:AgentService = inject(AgentService);
  db:Db = inject(Db);
  generalContactsCount: Signal<number> = toSignal(
    liveQuery(() =>
      this.db.contacts
        .where('offenderNumber')
        .equals(0)
        .count()
    ), { initialValue: 0 }
  );
  currentApplicationVersion = environment.appVersion;
  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'bell',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bell.svg')
    );
    iconRegistry.addSvgIcon(
      'add_black',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-black.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
  }
  ngOnInit() {
    console.log('GeneralContactsCount ... ', this.generalContactsCount());
  }
}

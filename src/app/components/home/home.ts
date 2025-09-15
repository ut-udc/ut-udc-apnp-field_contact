import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { OtherOffendersList } from '../other-offenders-list/other-offenders-list';
import { MyCaseload } from '../my-caseload/my-caseload';
import { Navigation } from '../../services/navigation';
import { Agent } from '../../model/Agent';
import { ContactData } from '../../services/contact-data';
import { Dao } from '../../services/dao';
import { Observable, from, of, Subscription } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NetworkService } from '../../services/network';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    OtherOffendersList,
    MyCaseload,
    AsyncPipe,
    CommonModule,
  ],
})
export class Home implements OnInit {
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);
  dao: Dao = inject(Dao);
  isOnline: boolean = true;
  user = new Observable<Agent>((observer) => {
    this.contactData.getPrimaryUser().then(async (user) => {
      if (user) {
        observer.next(user);
        this.contactData.applicationUserName = user.userId;
        console.log('User from app line 24:', user);
      } else {
        await this.contactData.populateAgent();
      }
    });
  });

  //this is the place where we can change the agentfor impersonation
  // currentAgent = new Observable<Agent>((observer) => {
  //   this.contactData.getAgentById(this.contactData.applicationUserName).then((agent) => {
  //     if (agent) {
  //       observer.next(agent);
  //       console.log('Current Agent line 49:', agent);
  //     } else {
  //       observer.next({} as Agent);
  //     }
  //   });
  // });
  currentAgent = new Observable<Agent>((observer) => {
    this.user.subscribe((agent) => {
      if (agent) {
        observer.next(agent);
        console.log('Current Agent line 49:', agent);
      } else {
        observer.next({} as Agent);
      }
    });
  });

  time = new Observable<string>((observer) => {
    setInterval(() => observer.next(new Date().toString()), 1000);
    console.log('Time from home line 41:', this.time);
  });

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    this.currentAgent.subscribe((agent) => {
      this.contactData.applicationUserName = agent.userId;
    });
    iconRegistry.addSvgIcon(
      'bell',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bell.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
  }
  async ngOnInit(): Promise<void> {}
}

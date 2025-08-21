import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { Offender } from '../../model/Offender';
import { Dao } from '../../services/dao';
import { Observable, from, of } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

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
    RouterLink
  ],
})
export class Home implements OnInit {
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);
  dao: Dao = inject(Dao);
  offlineStatus = new Observable<boolean>((observer) => {
    observer.next(false);
  });

  currentAgent = new Observable<Agent>((observer) => {
    this.contactData.getAgentById(this.dao.agent.agentId).then((agent) => {
      if (agent) {
        observer.next(agent);
        console.log('Agent from home line 41:', agent);
      } else {
        observer.next({} as Agent);
      }
    });
  });

  time = new Observable<string>((observer) => {
    setInterval(() => observer.next(new Date().toString()), 1000);
    console.log('Time from home line 41:', this.time);
  });

  constructor() 
  {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    this.currentAgent.subscribe((agent) => {
      this.contactData.applicationUserName = agent.agentId;
    });
    iconRegistry.addSvgIcon(
      'bell',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/bell.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/search.svg')
    );
  }
  async ngOnInit(): Promise<void> {
    window.addEventListener('online', async () => {
            if(!navigator.onLine){
              this.offlineStatus = of(true);
            } else {
              this.offlineStatus = of(false);
            }
          });
  }
}

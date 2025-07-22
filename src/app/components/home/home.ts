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
import { Router, ActivatedRoute } from '@angular/router';

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

  agentInitials: Observable<string> = new Observable<string>();
  initials: string = '';
  currentAgent: Agent = {
    agentId: '',
    firstName: 'default',
    lastName: '',
    fullName: '',
    email: '',
    image: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    supervisorId: '',
    ofndrNumList: ([] = []),
  };
  
  constructor() // private asyncPipe: AsyncPipe,
  // private changeDetectorRef: ChangeDetectorRef,
  // private ContactData: ContactData,
  // private Navigation: Navigation,
  // private Dao: Dao,
  // private Router: Router,
  // private ActivatedRoute: ActivatedRoute,
  {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    this.agentInitials = from(
      this.contactData.getAgentInitials(this.dao.agent.agentId, 'OnInit')
    );
    this.agentInitials.subscribe((value) => {
      console.log('Agent Initials subscribed:', value);
      this.initials = value;
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
  async getAgentInitials(): Promise<string> {
    const agent = await this.contactData.getAgentById(
      this.dao.agent.agentId,
      'getInitials'
    );
    if (!agent) {
      throw new Error('Agent not found');
    }
    var initials = '';
    setTimeout(() => {
      initials =
        agent.firstName.substring(0, 1) + agent.lastName.substring(0, 1);
      console.log('Agent Initials from getAgentInitials****:', this.initials);
    }, 1000);
    // console.log('Agent Initials from getAgentInitials:', initials);
    return initials;
  }

  
  async ngOnInit(): Promise<void> {
    // this.currentAgent = await this.navigationService.getAgent();
    // console.log('Current Agent:', this.currentAgent);
    const agent = await this.contactData.getAgentById(
      this.dao.agent.agentId,
      'OnInit'
    );
    console.log('Agent from home line 66:', agent);
    this.currentAgent = agent ?? this.currentAgent;
    console.log(
      'This Agent currentAgent gets set by agent:',
      this.currentAgent
    );
    // console.log('Agent', agent);
    console.log(
      'Promise from home line 71:',
      this.contactData.getAgentById(this.dao.agent.agentId, 'promise')
    );

  }
}

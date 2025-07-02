import { Component, inject, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { OtherOffendersList } from '../other-offenders-list/other-offenders-list';
import { MyCaseload } from '../my-caseload/my-caseload';
import { Navigation } from '../../services/navigation';
import { Agent } from '../../model/Agent';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    OtherOffendersList,
    MyCaseload,
  ],
})
export class Home implements OnInit {
  agentInitials: string = '';
  navigationService: Navigation = inject(Navigation);
  agent: Agent = this.navigationService.getAgent();

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'bell',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/bell.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/search.svg')
    );
  }
  ngOnInit(): void {
    this.agentInitials =
      this.agent.firstName.substring(0, 1) +
      this.agent.lastName.substring(0, 1);
  }
}

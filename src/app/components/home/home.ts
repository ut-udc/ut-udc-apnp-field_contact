import {Component, inject} from '@angular/core';
import {UserService} from '../../services/user-service';
import {AgentService} from '../../services/agent-service';
import {MyCaseload} from '../my-caseload/my-caseload';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ProxyUserSelect} from '../proxy-user-select/proxy-user-select';

@Component({
  selector: 'app-home',
  imports: [
    MyCaseload,
    MatToolbarRow,
    MatIconModule,
    MatToolbar,
    ProxyUserSelect
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  userService = inject(UserService);
  agentService:AgentService = inject(AgentService);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'bell',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bell.svg')
    );
    iconRegistry.addSvgIcon(
      'search',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/search.svg')
    );
  }
  getInitials(): string {
    const user = this.userService.user();
    if (user?.firstName || user?.lastName) {
      return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase();
    }

    const agent = this.agentService.primaryAgent();
    if (agent?.name) {
      const parts = agent.name.trim().split(' ');
      return (parts.length > 1
          ? parts[0][0] + parts[1][0]
          : agent.name.substring(0, 2)
      ).toUpperCase();
    }

    return '';
  }
}

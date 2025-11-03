import {Component, inject} from '@angular/core';
import {UserService} from '../../services/user-service';
import {AgentService} from '../../services/agent-service';
import {MyCaseload} from '../my-caseload/my-caseload';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ProxyUserSelect} from '../proxy-user-select/proxy-user-select';
import {environment} from '../../../environments/environment';

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

  currentApplicationVersion = environment.appVersion;
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
}

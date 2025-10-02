import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AgentService} from '../../services/agent-service';
import {MatButton} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {Select2String} from '../../models/select2-string';
import {Agent} from '../../models/agent';
import {Db} from '../../services/db';

@Component({
  selector: 'app-proxy-user-select',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatButton
  ],
  templateUrl: './proxy-user-select.html',
  styleUrl: './proxy-user-select.scss'
})
export class ProxyUserSelect implements OnInit {
  agentService:AgentService = inject(AgentService);
  db:Db = inject(Db);
  proxyForm: FormGroup = new FormGroup({
    proxyUserControl: new FormControl<string | null>(null)
  });
  proxyUserControl = new FormControl('', [Validators.required]);

  proxyUsers: Signal<Array<Select2String> |undefined> =  computed(() => {
    let agents: Agent[] = this.agentService.allAgents() ?? [];
    agents = agents.filter(agent => agent.name != null && agent.name !== '');
    agents = agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents?.map(agent => {
      let selectOption: Select2String = {id: agent.userId, text: agent.name};
      return selectOption;
    })
  });

  ngOnInit() {
    this.proxyForm = new FormGroup({
      proxyUser: this.proxyUserControl
    });
    console.log('Proxy Users: ' ,this.proxyUsers());
  }

  onSubmit() {
    if (this.proxyForm.valid) {
      const selectedUser = this.proxyForm.get('proxyUser')?.value;
      this.db.caseload.clear();
      this.agentService.updatePrimaryAgentStatus(1)
      this.agentService.updateProxyUser(selectedUser);
      console.log('Selected Proxy User:', selectedUser);
      // Implement further logic as needed
    } else {
      console.log('Form is invalid');
    }
  }
}

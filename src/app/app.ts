import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { AgentProfile } from './components/agent-profile/agent-profile';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            Home,
            AgentProfile
           ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'sup-contact';
}

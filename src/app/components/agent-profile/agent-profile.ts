import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-profile.html',
  styleUrl: './agent-profile.scss'
})
export class AgentProfile {
  constructor(private router: Router) {
    setTimeout(() => {
      router.navigateByUrl('home');

    }, 2000);

  }
}


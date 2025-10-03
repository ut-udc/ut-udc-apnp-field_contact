import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule,MatProgressSpinnerModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss'
})
export class SplashScreen {
  constructor(private router: Router) {
    setTimeout(() => {
      router.navigateByUrl('home');
    }, 2000);
  }
}

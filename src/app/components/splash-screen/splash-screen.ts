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

      const retrievedString = localStorage.getItem('goodEnough');

      if (retrievedString == null) {
        console.log('Reloading');
        window.location.reload();
      } else {
        console.log('Going Home');
        router.navigateByUrl('home');
      }

    }, 2000);
  }
}

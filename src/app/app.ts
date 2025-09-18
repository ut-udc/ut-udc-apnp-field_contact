import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LoadDataService} from './services/load-data-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  // template: '<app-home></app-home>',
  styleUrl: './app.scss'
})
export class App {
  loadDataService:LoadDataService = inject(LoadDataService);
  protected readonly title =this.loadDataService.appTitle();

}

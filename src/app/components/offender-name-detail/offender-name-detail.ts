import {Component, Input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {Offender} from '../../models/offender';

@Component({
  selector: 'app-offender-name-detail',
    imports: [
        DatePipe
    ],
  templateUrl: './offender-name-detail.html',
  styleUrl: './offender-name-detail.scss'
})
export class OffenderNameDetail {
  // @Input('currentOffender()') currentOffender!: Signal<Offender>;
  @Input() currentOffender!: Offender | undefined | null;

}

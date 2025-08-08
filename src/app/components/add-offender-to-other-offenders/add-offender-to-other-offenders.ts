import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-add-offender-to-other-offenders',
  imports: [
    MatIconModule,
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonModule,
  ],
  templateUrl: './add-offender-to-other-offenders.html',
  styleUrl: './add-offender-to-other-offenders.scss',
})
export class AddOffenderToOtherOffenders {
  offenderSearch: FormGroup = new FormGroup({
    offenderSearch: new FormControl<string | null>(null),
  });
  value = 'Clear me';

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../assets/icons/arrow_back.svg'
      )
    );
  }

  onSubmit() {
    console.log('Submit');
  }
}

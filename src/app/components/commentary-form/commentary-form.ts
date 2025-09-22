import {Component, inject, OnInit, Signal} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {CommonModule, DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {from} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Offender} from '../../models/offender';
import {Contact} from '../../models/contact';
import {Agent} from '../../models/agent';
import {MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef,} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {DetailHeader} from '../detail-header/detail-header';
import {toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {Select2Model} from '../../models/select2-model';
import {ContactService} from '../../services/contact-service';

@Component({
  selector: 'app-commentary-form',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatDividerModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatListModule,
    MatInputModule,
    ReactiveFormsModule,
    DatePipe,
    CommonModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    DetailHeader,
  ],
  templateUrl: './commentary-form.html',
  styleUrl: './commentary-form.scss',
})
export class CommentaryForm implements OnInit {
  db: Db = inject(Db)
  contactService: ContactService = inject(ContactService);
  route: ActivatedRoute = inject(ActivatedRoute);
  offenderNumber: number = 0;
  contactId: number = 0;
  errorClass: string = '';

  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(FieldVisitGuidelinesBottomSheet);
  }

  currentContact: Signal<Contact | undefined> = toSignal(from(
    liveQuery(() => this.db.contacts
      .where('contactId')
      .equals(Number(this.route.snapshot.params['contactId']))
      .first()))
  );

  primaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('userId')
      .equals(this.currentContact()!.primaryInterviewer)
      .first()))
  );

  secondaryInterviewer: Signal<Agent | undefined> = toSignal(from(
    liveQuery(() => this.db.agents
      .where('userId')
      .equals(this.currentContact()!.primaryInterviewer)
      .first()))
  );

  contactType: Signal<Select2Model | undefined> = toSignal(from(
    liveQuery(() => this.db.contactTypes
      .where('id')
      .equals(this.currentContact()!.contactTypeId)
      .first()))
  );

  location: Signal<Select2Model | undefined> = toSignal(from(
    liveQuery(() => this.db.locations
      .where('id')
      .equals(this.currentContact()!.locationId)
      .first()))
  );

  offender: Signal<Offender | undefined> = toSignal(from(
    liveQuery(() => this.db.caseload
      .where('offenderNumber')
      .equals(Number(this.route.snapshot.params['offenderNumber']))
      .first()))
  );

  commentaryForm: FormGroup = new FormGroup({
    wasContactSuccessful: new FormControl<number | null>(null),
    commentary: new FormControl<string | null>(null),
  });

  async onSubmit() {
    if (!navigator.onLine) {
      this.currentContact()!.formCompleted = true;
      this.currentContact()!.summary = this.commentaryForm.value.commentary ?? '';
      this.contactService.updateContact(this.currentContact()!);
      this.contactService.addPostContactToQueue(this.currentContact()!);
      this.contactService.removeContactFromContacts(this.currentContact()!.contactId);

      // ((contact) => {
      //   contact.formCompleted = true;
      //   contact.summary = this.commentaryForm.value.commentary ?? '';
      //   this.contactData.addPostContactToQueue(contact);
      //   this.contactData.removeContactFromContacts(contact.contactId);
      // });
      return;
    } else {
      this.currentContact()!.formCompleted = true;
      this.currentContact()!.summary = this.commentaryForm.value.commentary ?? '';
      this.contactService.syncContactWithDatabase(this.currentContact()!);
      this.contactService.updateContact(this.currentContact()!);
    }
    // window.location.href = 'offender-detail/' + this.offenderNumber;
  }

  async ngOnInit() {
  }

  constructor() {
    this.offenderNumber = Number(this.route.snapshot.params['offenderNumber']);
    this.contactId = Number(this.route.snapshot.params['contactId']);

    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
  }

  madeContact() {
    this.currentContact()!.wasContactSuccessful = 1;
    this.contactService.updateContact(this.currentContact()!);
  }

  attemptedContact() {
    this.currentContact()!.wasContactSuccessful = 0
    this.contactService.updateContact(this.currentContact()!);
  }

}
  @Component({
    selector: 'field-visit-guidelines-bottom-sheet',
    standalone: true,
    imports: [CommonModule, MatListModule],
    templateUrl: './field-visit-guidelines-bottom-sheet.html',
    styleUrl: './field-visit-guidelines-bottom-sheet.scss',
  })

  export class FieldVisitGuidelinesBottomSheet {
    private _bottomSheetRef: MatBottomSheetRef<FieldVisitGuidelinesBottomSheet> =
      inject(MatBottomSheetRef<FieldVisitGuidelinesBottomSheet>);

    openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss();
      event.preventDefault();
    }
  }

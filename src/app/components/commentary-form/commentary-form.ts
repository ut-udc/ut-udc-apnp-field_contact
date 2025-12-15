import {Component, computed, effect, inject, Signal, ViewChild} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {CommonModule, DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {from, of, switchMap} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef,} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggle, MatButtonToggleModule} from '@angular/material/button-toggle';
import {DetailHeader} from '../detail-header/detail-header';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {liveQuery} from 'dexie';
import {Db} from '../../services/db';
import {ContactService} from '../../services/contact-service';
import {AgentService} from '../../services/agent-service';
import {SnackBarService} from '../../services/snack-bar-service';
import {CommonDialogService} from '../../services/common-dialog-service';

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
export class CommentaryForm  {
  db: Db = inject(Db)
  contactService: ContactService = inject(ContactService);
  agentService: AgentService = inject(AgentService);
  snackBarService: SnackBarService = inject(SnackBarService);
  dialogService: CommonDialogService = inject(CommonDialogService);
  route: ActivatedRoute = inject(ActivatedRoute);
  offenderNumber: number | null | undefined = 0;
  contactId: number = 0;
  errorClass: string = '';
  router: Router = inject(Router);

  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(FieldVisitGuidelinesBottomSheet);
  }


// 1. Current contact signal
  currentContact = toSignal(
    from(
      liveQuery(() =>
        this.db.contacts
          .where('contactId')
          .equals(Number(this.route.snapshot.params['contactId']))
          .first()
      )
    ),
    { initialValue: undefined }
  );
routeOffenderNumber: number = Number(this.route.snapshot.params['offenderNumber']);
// 2. Compute selected offender number
  selectedOffenderNumber = computed(() => {
    const contact = this.currentContact();
    if (contact?.selectedOffender && contact.formCompleted) {
      return contact.selectedOffender;
    }
    return Number(this.route.snapshot.params['offenderNumber']);
  });

// 3. Convert signal to Observable
  selectedOffenderNumber$ = toObservable(this.selectedOffenderNumber);

// 4. Reactive offender signal
  offender = toSignal(
    this.selectedOffenderNumber$.pipe(
      switchMap(num => {
        if (!num) return of(undefined);
        return liveQuery(() =>
          this.db.caseload
            .where('offenderNumber')
            .equals(num)
            .first()
        );
      })
    ),
    { initialValue: undefined }
  );



  commentaryForm: FormGroup = new FormGroup({
    wasContactSuccessful: new FormControl<number | null>(null),
    commentary: new FormControl<string | null>(null),
  });

  contactResultTypeById: Signal<string> = computed(() => {
    return this.agentService.allContactResultTypes()?.find(typ => typ.id === this.commentaryForm.value.result)?.text.trim() ?? '';
  });

  async confirmSubmit() {
    this.dialogService.openConfirmDialog().subscribe(async result => {
      if(result) {
        console.log('Action confirmed!');
        this.freshSubmit = true;
        this.offenderNumber = this.currentContact()?.offenderNumber;
        const status:boolean = await this.onSubmit();
        if(status) {
          this.snackBarService.show('Contact saved successfully.');
          if (this.offenderNumber == 0) {
            setTimeout(()=>{
              this.router.navigate(['/home']);
            },100);
          } else {
            setTimeout(()=>{
              this.router.navigate(['/offender-detail', this.offenderNumber]);
            },100);
          }
        }
      } else {
        console.log('Cancelled!');
      }
    });
  }
  freshSubmit:boolean = false;
  async onSubmit(): Promise<boolean> {
    const contact = this.currentContact();
    if(!contact) {
      return false;
    }
    if((contact.selectedOffender ?? 0) > 0){
      contact.offenderNumber = Number(contact.selectedOffender);
      this.offenderNumber = contact.offenderNumber;
    }
    contact.formCompleted = true;
    contact.summary = this.commentaryForm.value.commentary ?? '';
    if (!navigator.onLine || contact!.offenderNumber == 0) {
      // const result = this.currentContact()?.result;
      contact.resultDescription = this.contactResultTypeById();
      await this.contactService.updateContact(contact);
      // this.contactService.addPostContactToQueue(this.currentContact()!);
      // this.contactService.removeContactFromContacts(this.currentContact()!.contactId);
      return true;
    } else {
      await this.contactService.updateContact(contact);
      const response: Response | null = await this.contactService.syncContactWithDatabase(this.currentContact()!);
      if (response != null && !response.ok && response.status == 500) {
        if (this.freshSubmit) {
          this.dialogService.open500TryAgainDialog().subscribe(async result => {
            if (result) {
              console.log('Action confirmed!');
              this.freshSubmit = false;
              const status:boolean = await this.onSubmit();
              if(status) {
                this.snackBarService.show('Contact saved successfully.');
                if (this.offenderNumber) {
                  await this.router.navigate(['/offender-detail', this.offenderNumber]);
                }
              }
            }
          });
        } else {
          await this.router.navigate(['/','500']);
          return false;
        }
        return false;
      } else {
        return true;
      }
    }
    // window.location.href = 'offender-detail/' + this.offenderNumber;
  }

  @ViewChild('madeContactToggle') madeContactToggle!: MatButtonToggle;
  @ViewChild('attemptedContactToggle') attemptedContactToggle!: MatButtonToggle;

  constructor() {
    this.offenderNumber = Number(this.route.snapshot.params['offenderNumber']);
    this.contactId = Number(this.route.snapshot.params['contactId']);

    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'arrow_back',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_back.svg')
    );
    effect(() => {
      const contact = this.currentContact();
      if (!contact) return;
      if(contact && contact.selectedOffender && contact.selectedOffender> 0 && contact.formCompleted) {
        setTimeout(() => {
          // this.commentaryForm.updateValueAndValidity();
          this.commentaryForm.patchValue({
            commentary: contact?.summary,
          });
          if (contact.result == 1) {
            // this.madeContact();
            this.madeContactToggle._buttonElement.nativeElement.click();
          }
          if (contact.result == 4) {
            // this.attemptedContact();
            this.attemptedContactToggle._buttonElement.nativeElement.click();
          }
        }, 100);
      }
    });
  }

  madeContact() {
    this.currentContact()!.result = 1;
    this.contactService.updateContact(this.currentContact()!);
  }

  attemptedContact() {
    this.currentContact()!.result = 4
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

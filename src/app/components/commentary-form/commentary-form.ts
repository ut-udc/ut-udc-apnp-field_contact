import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { Offender } from '../../model/Offender';
import { ActivatedRoute } from '@angular/router';
import { Navigation } from '../../services/navigation';
import { ContactData } from '../../services/contact-data';
import { Contact } from '../../model/Contact';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Agent } from '../../model/Agent';
import { ContactForm } from '../contact-form/contact-form';

@Component({
  selector: 'app-commentary-form',
  imports: [
    MatIconModule,
    RouterLink,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './commentary-form.html',
  styleUrl: './commentary-form.scss',
})
export class CommentaryForm implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  navigationService: Navigation = inject(Navigation);
  contactData: ContactData = inject(ContactData);

  currentContact: Contact = {
    contactId: 0,
    ofndrNum: 0,
    agentId: '',
    secondaryAgentId: '',
    contactDate: new Date(),
    contactType: '',
    location: '',
    commentary: '',
    formCompleted: false,
    previouslySuccessful: false,
  };
  currentAgent: Agent = {
    agentId: '',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    image: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    supervisorId: '',
    myCaseload: [],
    otherOffenders: [],
  };

  commentaryForm: FormGroup = new FormGroup({
    commentary: new FormControl<string | null>(null),
  });

  onSubmit() {
    // debugger
    this.currentContact.formCompleted = true;
    this.currentContact.commentary = this.commentaryForm.value.commentary ?? '';
    this.contactData.updateContact(
      this.currentContact
    );
  }

  async ngOnInit() {
    // debugger
    const contactId: number = Number(this.route.snapshot.params['id']);
    const contact = await this.contactData.getContactById(contactId);
    this.currentContact = contact ?? this.currentContact;
    this.commentaryForm.patchValue({
      commentary: this.currentContact?.commentary,
    });
    this.currentAgent =
      this.navigationService.getOfficerByAgentId(
        this.currentContact?.agentId
      ) ?? this.navigationService.getAgent();
  }

  //this needs to be fixed wrong "id" is referenced but fine for now
  offender: Offender | undefined =
    this.navigationService.getCaseloadOffenderById(
      Number(this.route.snapshot.params['id'])
    );

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
}

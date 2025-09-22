import {Routes} from '@angular/router';
import {Home} from './components/home/home';
import {OffenderDetail} from './components/offender-detail/offender-detail';
import {ContactForm} from './components/contact-form/contact-form';
import {CommentaryForm} from './components/commentary-form/commentary-form';
import {ContactDetailView} from './components/contact-detail-view/contact-detail-view';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Supervision Contact Home',
  },
  {
    path: 'offender-detail/:offenderNumber',
    component: OffenderDetail,
    title: 'Offender Detail',
  },
  {
    path: 'contact-form/:offenderNumber',
    component: ContactForm,
    title: 'Contact Form',
  },
  {
    path: 'contact-form/:offenderNumber/:contactId',
    component: ContactForm,
    title: 'Contact Form',
  },
  {
    path: 'commentary-form/:offenderNumber/:contactId',
    component: CommentaryForm,
    title: 'Commentary Form',
  },
  // {
  //   path: 'agent-profile',
  //   component: AgentProfile,
  //   title: 'Agent Profile',
  // },
  {
    path: 'contact-detail-view/:contactId',
    component: ContactDetailView,
    title: 'Contact Detail View',
  },
  // {
  //   path: 'add-offender-to-other-offenders',
  //   component: AddOffenderToOtherOffenders,
  //   title: 'Add Offender to Other Offenders',
  // },
];

import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { OffenderDetail } from './components/offender-detail/offender-detail';
import { ContactForm } from './components/contact-form/contact-form';
import { CommentaryForm } from './components/commentary-form/commentary-form';
import { AgentProfile } from './components/agent-profile/agent-profile';
import { ContactDetailView } from './components/contact-detail-view/contact-detail-view';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home',
  },
  {
    path: 'offender-detail/:ofndrNum',
    component: OffenderDetail,
    title: 'Offender Detail',
  },
  {
    path: 'contact-form/:ofndrNum',
    component: ContactForm,
    title: 'Contact Form',
  },
  {
    path: 'contact-form/:ofndrNum/:contactId',
    component: ContactForm,
    title: 'Contact Form',
  },
  {
    path: 'commentary-form/:ofndrNum/:contactId',
    component: CommentaryForm,
    title: 'Commentary Form',
  },
  {
    path: 'agent-profile',
    component: AgentProfile,
    title: 'Agent Profile',
  },
  {
    path: 'contact-detail-view/:contactId',
    component: ContactDetailView,
    title: 'Contact Detail View',
  }
];

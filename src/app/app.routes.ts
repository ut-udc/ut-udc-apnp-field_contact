import {Routes} from '@angular/router';
import {Home} from './components/home/home';
import {OffenderDetail} from './components/offender-detail/offender-detail';
import ContactForm from './components/contact-form/contact-form';
import {CommentaryForm} from './components/commentary-form/commentary-form';
import {ContactDetailView} from './components/contact-detail-view/contact-detail-view';
import {AgentProfile} from './components/agent-profile/agent-profile';
import {SplashScreen} from './components/splash-screen/splash-screen';
import {ErrorPage} from './components/error-page/error-page';

export const routes: Routes = [
  {
    path: 'home',
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
  {
    path: 'agent-profile',
    component: AgentProfile,
    title: 'Agent Profile',
  },
  {
    path: '',
    component: SplashScreen,
    title: 'Splash Screen',
  },
  {
    path: 'contact-detail-view/:contactId',
    component: ContactDetailView,
    title: 'Contact Detail View',
  },
  {
    path: '**',
    component: ErrorPage,
  },
  // {
  //   path: 'add-offender-to-other-offenders',
  //   component: AddOffenderToOtherOffenders,
  //   title: 'Add Offender to Other Offenders',
  // },
];

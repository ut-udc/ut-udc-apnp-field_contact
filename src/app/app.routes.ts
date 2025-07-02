import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { OffenderDetail } from './components/offender-detail/offender-detail';
import { ContactForm } from './components/contact-form/contact-form';
import { CommentaryForm } from './components/commentary-form/commentary-form';
import { AgentProfile } from './components/agent-profile/agent-profile';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'Home'
    },
    {
        path: 'offender-detail/:id',
        component: OffenderDetail,
        title: 'Offender Detail'
    },
    {
        path: 'contact-form/:id',
        component: ContactForm,
        title: 'Contact Form'
    },
    {
        path: 'contact-form/:id/:contactId',
        component: ContactForm,
        title: 'Contact Form'
    },
    {
         path: 'commentary-form/:id',
        component: CommentaryForm,
        title: 'Commentary Form'
    },
    {
        path: 'agent-profile',
        component: AgentProfile,
        title: 'Agent Profile'
    }
];

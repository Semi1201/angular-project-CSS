import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { RecordsList } from './features/records/records-list/records-list';
import { RecordAdd } from './features/records/record-add/record-add';
import { RecordDetails } from './features/records/record-details/record-details';
import { RecordEdit } from './features/records/record-edit/record-edit';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'records', component: RecordsList },
    { path: 'records/add', component: RecordAdd },
    { path: 'records/:id', component: RecordDetails },
    { path: 'records/:id/edit', component: RecordEdit },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
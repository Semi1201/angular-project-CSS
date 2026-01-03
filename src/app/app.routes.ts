import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { RecordsList } from './features/records/records-list/records-list';
import { RecordAdd } from './features/records/record-add/record-add';
import { RecordDetails } from './features/records/record-details/record-details';
import { RecordEdit } from './features/records/record-edit/record-edit';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'records', component: RecordsList, canActivate: [authGuard] },
    { path: 'records/add', component: RecordAdd, canActivate: [authGuard, roleGuard(['Salesperson', 'Store Manager', 'System Admin'])] },
    { path: 'records/:id', component: RecordDetails, canActivate: [authGuard] },
    { path: 'records/:id/edit', component: RecordEdit, canActivate: [authGuard, roleGuard(['Store Manager', 'System Admin'])] },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
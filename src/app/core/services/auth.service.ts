import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDto, UserRole } from '../models/user.dto';

const STORAGE_KEY = 'music-app-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userSubject = new BehaviorSubject<UserDto | null>(this.loadUser()); //<< added user as it was not retaining the information
    user$ = this.userSubject.asObservable();

    login(email: string, password: string): boolean {
        // no specific email, checks if it has particular word, assigns role accordingly
        let role: UserRole = 'Salesperson';
        if (email.toLowerCase().includes('manager')) role = 'Store Manager';
        if (email.toLowerCase().includes('admin')) role = 'System Admin';

        //server.js accepts Bearer admin123
        const user: UserDto = { email, role, token: 'admin123' };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.userSubject.next(user);
        return true;
    }

    logout(): void {
        localStorage.removeItem(STORAGE_KEY);
        this.userSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!this.userSubject.value;
    }

    getRole(): UserRole | null {
        return this.userSubject.value?.role ?? null;
    }

    getToken(): string | null {
        return this.userSubject.value?.token ?? null;
    }

    private loadUser(): UserDto | null {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as UserDto) : null;
    }
}
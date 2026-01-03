import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDto, UserRole } from '../models/user.dto';

const STORAGE_KEY = 'music-app-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userSubject = new BehaviorSubject<UserDto | null>(null);
    user$ = this.userSubject.asObservable();

    login(email: string, password: string): boolean {
        // no specific email, checks if it has particular word, assigns role accordingly
        let role: UserRole = 'Salesperson';
        if (email.toLowerCase().includes('manager')) role = 'Store Manager';
        if (email.toLowerCase().includes('admin')) role = 'System Admin';

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
}
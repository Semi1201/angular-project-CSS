import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.dto';

export const roleGuard = (allowed: UserRole[]): CanActivateFn => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        const role = auth.getRole();

        if (role && allowed.includes(role)) return true;

        router.navigate(['/records']);
        return false;
    };
};
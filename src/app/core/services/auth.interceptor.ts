import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const raw = localStorage.getItem('music-app-auth');
    const token = raw ? JSON.parse(raw).token : null;

    if (!token) return next(req);

    return next(
        req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        })
    );
};
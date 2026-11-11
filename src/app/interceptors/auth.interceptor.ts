import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 en una ruta protegida = token caducat o invàlid (p. ex. si has canviat el JWT_SECRET).
      // A /auth/ un 401 només vol dir "credencials incorrectes", així que no tanquem sessió.
      if (err.status === 401 && !req.url.includes('/auth/')) {
        toast.error('La sessió ha caducat. Torna a iniciar sessió.');
        auth.logout('/login');
      }
      return throwError(() => err);
    })
  );
};

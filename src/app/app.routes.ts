import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoryComponent } from './pages/history/history.component';
import { HistoryYearsComponent } from './pages/history-years/history-years.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'historial', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'historial/anys', component: HistoryYearsComponent, canActivate: [authGuard] },
  { path: 'analisi', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'categories/:id/edit', component: EditCategoryComponent, canActivate: [authGuard] },
  // El comodí SEMPRE ha d'anar l'últim: Angular comprova les rutes en ordre
  { path: '**', redirectTo: '' }
];

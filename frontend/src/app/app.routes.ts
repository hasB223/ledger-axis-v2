import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthPageComponent } from './features/auth/pages/auth-page.component';
import { CompaniesListComponent } from './features/companies/components/companies-list.component';
import { CompanyDetailComponent } from './features/companies/components/company-detail.component';
import { WatchlistPageComponent } from './features/watchlist/pages/watchlist-page.component';

export const appRoutes: Routes = [
  { path: 'login', component: AuthPageComponent },
  { path: 'companies', canActivate: [authGuard], component: CompaniesListComponent },
  { path: 'companies/new', canActivate: [authGuard], component: CompanyDetailComponent },
  { path: 'companies/:id', canActivate: [authGuard], component: CompanyDetailComponent },
  { path: 'watchlist', canActivate: [authGuard], component: WatchlistPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'companies' }
];

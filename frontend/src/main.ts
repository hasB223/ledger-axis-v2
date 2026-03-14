import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { ShellComponent } from './app/core/layout/shell.component';

bootstrapApplication(ShellComponent, {
  providers: [provideRouter(appRoutes), provideHttpClient(withInterceptors([authInterceptor]))]
}).catch((error: unknown) => {
  console.error('Failed to bootstrap LedgerAxis frontend', error);
});

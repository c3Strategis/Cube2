import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function authenticationGuard(): CanActivateFn {
  return () => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const router: Router = inject(Router) 
    
    if (authService.isAuthenticated() ) {
      console.log('Authenticated')
      return true;
    }
    console.log('Not Authenticated')
    router.navigate(['/login'])
    // oauthService.login();
    return false;
  };
}
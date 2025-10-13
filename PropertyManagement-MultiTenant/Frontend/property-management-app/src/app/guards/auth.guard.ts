import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Check if route has role requirements
      if (route.data['roles']) {
        const requiredRoles = route.data['roles'] as string[];
        if (currentUser.role && requiredRoles.includes(currentUser.role)) {
          return true;
        } else {
          // Role not authorized, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // Logged in, so return true
      return true;
    }

    // Not logged in, redirect to login page with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}


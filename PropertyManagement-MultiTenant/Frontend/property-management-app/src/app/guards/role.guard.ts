import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Resource, Action } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route requires specific roles
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      if (!this.authService.hasAnyRole(requiredRoles)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // Check if route requires specific permissions
    const requiredPermission = route.data['permission'] as { resource: Resource; action: Action };
    if (requiredPermission) {
      if (!this.authService.hasPermission(requiredPermission.resource, requiredPermission.action)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // Check if route requires admin role
    const requiresAdmin = route.data['requiresAdmin'] as boolean;
    if (requiresAdmin && !this.authService.isAdmin()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Resource, Action } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser: any;
  companyName = '';

  menuItems = [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: '/dashboard', 
      roles: ['Admin', 'Manager', 'SalesRep', 'User'] 
    },
    { 
      icon: 'home_work', 
      label: 'Properties', 
      route: '/properties', 
      roles: ['Admin', 'Manager', 'SalesRep', 'User'] 
    },
    { 
      icon: 'work', 
      label: 'Projects', 
      route: '/projects', 
      roles: ['Admin', 'Manager', 'User'] 
    },
    { 
      icon: 'group_add', 
      label: 'Leads', 
      route: '/leads', 
      roles: ['Admin', 'Manager', 'SalesRep'] 
    },
    { 
      icon: 'timeline', 
      label: 'CRM Pipeline', 
      route: '/crm-pipeline', 
      roles: ['Admin', 'Manager', 'SalesRep'] 
    },
    { 
      icon: 'people', 
      label: 'Customers', 
      route: '/customers', 
      roles: ['Admin', 'Manager', 'SalesRep', 'User'] 
    },
    { 
      icon: 'receipt_long', 
      label: 'Invoices', 
      route: '/invoices', 
      roles: ['Admin', 'Manager', 'User'] 
    },
    { 
      icon: 'build', 
      label: 'Maintenance', 
      route: '/maintenance', 
      roles: ['Admin', 'Manager', 'User'] 
    },
    { 
      icon: 'analytics', 
      label: 'Analytics', 
      route: '/analytics', 
      roles: ['Admin', 'Manager'] 
    },
    { 
      icon: 'admin_panel_settings', 
      label: 'User Management', 
      route: '/users', 
      roles: ['admin', 'manager'],
      permission: { resource: Resource.USERS, action: Action.VIEW }
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.companyName = this.currentUser.companyName || 'Company Name';
    }
    
    // Debug: Log current user and sidebar state
    console.log('Current user:', this.currentUser);
    console.log('Sidebar collapsed:', this.isCollapsed);
    console.log('Menu items:', this.menuItems);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasAccess(menuItem: any): boolean {
    if (!this.currentUser) {
      console.log('No current user found');
      return false;
    }
    
    // For development - allow access to all menu items
    // This ensures the sidebar is visible while we're setting up the role system
    // TODO: Implement proper role-based access control when backend is ready
    console.log('Allowing access to:', menuItem.label);
    return true;
    
    // Future role-based access control (commented out for development)
    /*
    // Check role-based access
    if (menuItem.roles && menuItem.roles.length > 0) {
      const hasRole = this.authService.hasAnyRole(menuItem.roles);
      if (!hasRole) return false;
    }
    
    // Check permission-based access
    if (menuItem.permission) {
      const hasPermission = this.authService.hasPermission(
        menuItem.permission.resource, 
        menuItem.permission.action
      );
      if (!hasPermission) return false;
    }
    
    return true;
    */
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  get userFullName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
  }
}


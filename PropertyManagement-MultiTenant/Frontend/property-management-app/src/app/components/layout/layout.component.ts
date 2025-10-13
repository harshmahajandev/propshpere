import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasAccess(roles: string[]): boolean {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
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


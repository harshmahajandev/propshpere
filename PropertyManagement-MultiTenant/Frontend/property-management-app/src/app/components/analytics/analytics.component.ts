import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  sidenavOpened = true;
  
  // Mock data for demonstration
  propertyStats = {
    total: 12,
    available: 5,
    rented: 4,
    sold: 2,
    maintenance: 1
  };

  revenueData: ChartData[] = [
    { label: 'Jan', value: 18500, color: '#3b82f6' },
    { label: 'Feb', value: 22000, color: '#3b82f6' },
    { label: 'Mar', value: 19800, color: '#3b82f6' },
    { label: 'Apr', value: 24500, color: '#3b82f6' },
    { label: 'May', value: 26300, color: '#3b82f6' },
    { label: 'Jun', value: 28900, color: '#3b82f6' }
  ];

  occupancyRate = 78;
  avgRentPrice = 2850;
  totalRevenue = 140000;
  activeLeases = 32;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToProperties(): void {
    this.router.navigate(['/properties']);
  }

  navigateToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  navigateToMaintenance(): void {
    this.router.navigate(['/maintenance']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}


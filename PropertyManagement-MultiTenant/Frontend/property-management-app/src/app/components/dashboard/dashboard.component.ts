import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats, RecentActivity } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats | null = null;
  recentActivities: RecentActivity[] = [];
  loading = true;

  kpiCards = [
    { 
      title: 'Total Properties', 
      value: 0, 
      icon: 'home_work', 
      color: '#667eea',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Available Units', 
      value: 0, 
      icon: 'check_circle', 
      color: '#10b981',
      trend: '+8%',
      trendUp: true
    },
    { 
      title: 'Total Customers', 
      value: 0, 
      icon: 'people', 
      color: '#f59e0b',
      trend: '+15%',
      trendUp: true
    },
    { 
      title: 'Monthly Revenue', 
      value: 0, 
      icon: 'attach_money', 
      color: '#8b5cf6',
      trend: '+5%',
      trendUp: true,
      isCurrency: true
    },
    { 
      title: 'Occupancy Rate', 
      value: 0, 
      icon: 'trending_up', 
      color: '#06b6d4',
      trend: '+3%',
      trendUp: true,
      isPercentage: true
    },
    { 
      title: 'Active Leases', 
      value: 0, 
      icon: 'description', 
      color: '#ec4899',
      trend: '+10',
      trendUp: true
    },
    { 
      title: 'Pending Maintenance', 
      value: 0, 
      icon: 'build', 
      color: '#ef4444',
      trend: '-2',
      trendUp: true
    },
    { 
      title: 'Total Revenue', 
      value: 0, 
      icon: 'account_balance', 
      color: '#14b8a6',
      trend: '+18%',
      trendUp: true,
      isCurrency: true
    }
  ];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // For now, use mock data since backend might not be ready
    // Replace with actual API calls when backend is available
    
    // this.dashboardService.getStats().subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.stats = response.data;
    //       this.updateKPICards();
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading stats:', error);
    //     this.loadMockData();
    //   }
    // });

    // Use mock data for now
    this.loadMockData();
  }

  loadMockData(): void {
    setTimeout(() => {
      this.stats = this.dashboardService.getMockStats();
      this.recentActivities = this.dashboardService.getMockActivities();
      this.updateKPICards();
      this.loading = false;
    }, 500);
  }

  updateKPICards(): void {
    if (!this.stats) return;

    this.kpiCards[0].value = this.stats.totalProperties;
    this.kpiCards[1].value = this.stats.availableProperties;
    this.kpiCards[2].value = this.stats.totalCustomers;
    this.kpiCards[3].value = this.stats.monthlyRevenue;
    this.kpiCards[4].value = this.stats.occupancyRate;
    this.kpiCards[5].value = this.stats.activeLeases;
    this.kpiCards[6].value = this.stats.pendingMaintenance;
    this.kpiCards[7].value = this.stats.totalRevenue;
  }

  formatValue(card: any): string {
    if (card.isCurrency) {
      return '$' + this.formatNumber(card.value);
    } else if (card.isPercentage) {
      return card.value.toFixed(1) + '%';
    } else {
      return card.value.toString();
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return new Date(date).toLocaleDateString();
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      property: 'home_work',
      customer: 'person_add',
      invoice: 'receipt',
      maintenance: 'build'
    };
    return icons[type] || 'notifications';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      property: '#667eea',
      customer: '#10b981',
      invoice: '#f59e0b',
      maintenance: '#ef4444'
    };
    return colors[type] || '#6b7280';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  get userName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'User';
  }
}

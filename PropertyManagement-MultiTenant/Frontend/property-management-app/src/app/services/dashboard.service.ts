import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  totalCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingMaintenance: number;
  activeLeases: number;
}

export interface RecentActivity {
  id: string;
  type: 'property' | 'customer' | 'invoice' | 'maintenance';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  getRecentActivities(): Observable<ApiResponse<RecentActivity[]>> {
    return this.http.get<ApiResponse<RecentActivity[]>>(`${this.apiUrl}/activities`);
  }

  // Mock data for development
  getMockStats(): DashboardStats {
    return {
      totalProperties: 124,
      availableProperties: 18,
      totalCustomers: 89,
      totalRevenue: 1250000,
      monthlyRevenue: 95000,
      occupancyRate: 85.5,
      pendingMaintenance: 7,
      activeLeases: 106
    };
  }

  getMockActivities(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'property',
        title: 'New Property Added',
        description: 'Villa #205 added to the system',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: 'John Doe'
      },
      {
        id: '2',
        type: 'customer',
        title: 'New Customer Registered',
        description: 'Sarah Johnson signed lease for Apt #302',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        user: 'Jane Smith'
      },
      {
        id: '3',
        type: 'invoice',
        title: 'Invoice Paid',
        description: 'Invoice #INV-2024-0321 - $2,500',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        user: 'System'
      },
      {
        id: '4',
        type: 'maintenance',
        title: 'Maintenance Request',
        description: 'AC repair needed in Unit #401',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
        user: 'Mike Wilson'
      },
      {
        id: '5',
        type: 'property',
        title: 'Property Updated',
        description: 'Updated pricing for Villa #103',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        user: 'Admin'
      }
    ];
  }
}


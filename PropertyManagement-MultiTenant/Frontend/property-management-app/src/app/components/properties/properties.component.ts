import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  filterStatus = 'all';
  sidenavOpened = true;

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    
    // Auto-collapse sidenav on mobile
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  loadProperties(): void {
    this.loading = true;
    this.errorMessage = '';

    this.propertyService.getProperties().subscribe({
      next: (response) => {
        if (response.success) {
          this.properties = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load properties';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading properties';
        this.loading = false;
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  addProperty(): void {
    this.router.navigate(['/properties/add']);
  }

  editProperty(property: Property): void {
    this.router.navigate(['/properties/edit', property.id]);
  }

  deleteProperty(property: Property): void {
    if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
      this.propertyService.deleteProperty(property.id).subscribe({
        next: () => {
          this.loadProperties();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete property';
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'Available': 'success',
      'Reserved': 'warning',
      'Sold': 'primary',
      'Rented': 'accent',
      'Under Maintenance': 'warn'
    };
    return statusColors[status] || 'default';
  }

  get filteredProperties(): Property[] {
    let filtered = this.properties;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.propertyType.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === this.filterStatus);
    }

    return filtered;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    // Implement logout
    this.router.navigate(['/login']);
  }
}


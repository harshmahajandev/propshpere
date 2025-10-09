import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  filterType = 'all';
  sidenavOpened = true;

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load customers';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading customers';
        this.loading = false;
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  addCustomer(): void {
    // Navigate to add customer form
  }

  editCustomer(customer: Customer): void {
    // Navigate to edit customer form
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete "${customer.fullName}"?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete customer';
        }
      });
    }
  }

  get filteredCustomers(): Customer[] {
    let filtered = this.customers;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.fullName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      );
    }

    if (this.filterType !== 'all') {
      filtered = filtered.filter(c => c.customerType === this.filterType);
    }

    return filtered;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToProperties(): void {
    this.router.navigate(['/properties']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}


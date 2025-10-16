import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer, CustomerType, RiskLevel } from '../../models/customer.model';

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

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    // Use mock data for now
    setTimeout(() => {
      this.customers = this.getMockCustomers();
      this.loading = false;
    }, 500);

    // When backend is ready:
    // this.customerService.getCustomers().subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.customers = response.data;
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     this.errorMessage = 'Error loading customers';
    //     this.loading = false;
    //   }
    // });
  }

  getMockCustomers(): Customer[] {
    return [
      {
        id: '1',
        fullName: 'Ahmed Al-Rashid',
        email: 'ahmed.rashid@email.com',
        phone: '+973 3912 3456',
        nationality: 'Bahraini',
        address: 'Manama, Bahrain',
        customerType: CustomerType.Individual,
        riskLevel: RiskLevel.Low,
        requirements: 'Looking for luxury villa',
        linkedUserId: undefined,
        totalPurchaseValue: 850000,
        propertiesPurchased: 2,
        companyId: '',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-10-10')
      },
      {
        id: '2',
        fullName: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        phone: '+973 3823 4567',
        nationality: 'American',
        address: 'Riffa, Bahrain',
        customerType: CustomerType.Corporate,
        riskLevel: RiskLevel.Medium,
        requirements: 'Commercial property portfolio',
        linkedUserId: undefined,
        totalPurchaseValue: 2500000,
        propertiesPurchased: 5,
        companyId: '',
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-10-12')
      },
      {
        id: '3',
        fullName: 'Mohammed Al-Khalifa',
        email: 'mohammed.k@email.com',
        phone: '+973 3734 5678',
        nationality: 'Bahraini',
        address: 'Muharraq, Bahrain',
        customerType: CustomerType.Individual,
        riskLevel: RiskLevel.Low,
        requirements: 'Residential apartment',
        linkedUserId: undefined,
        totalPurchaseValue: 450000,
        propertiesPurchased: 1,
        companyId: '',
        createdAt: new Date('2024-06-10'),
        updatedAt: new Date('2024-09-15')
      },
      {
        id: '4',
        fullName: 'Investment Group Ltd',
        email: 'info@investmentgroup.com',
        phone: '+973 1234 5678',
        nationality: 'International',
        address: 'Financial Harbor, Bahrain',
        customerType: CustomerType.Corporate,
        riskLevel: RiskLevel.High,
        requirements: 'Large scale development',
        linkedUserId: undefined,
        totalPurchaseValue: 5000000,
        propertiesPurchased: 10,
        companyId: '',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-10-13')
      }
    ];
  }

  addCustomer(): void {
    alert('Add Customer feature - Coming soon!');
  }

  editCustomer(customer: Customer): void {
    alert(`Edit ${customer.fullName} - Coming soon!`);
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete "${customer.fullName}"?`)) {
      this.customers = this.customers.filter(c => c.id !== customer.id);
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
}

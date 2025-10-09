import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  filterStatus = 'all';
  sidenavOpened = true;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  loadInvoices(): void {
    this.loading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: (response) => {
        if (response.success) {
          this.invoices = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load invoices';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading invoices';
        this.loading = false;
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  addInvoice(): void {
    // Navigate to add invoice form
  }

  editInvoice(invoice: Invoice): void {
    // Navigate to edit invoice form
  }

  deleteInvoice(invoice: Invoice): void {
    if (confirm(`Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`)) {
      this.invoiceService.deleteInvoice(invoice.id).subscribe({
        next: () => {
          this.loadInvoices();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete invoice';
        }
      });
    }
  }

  get filteredInvoices(): Invoice[] {
    let filtered = this.invoices;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.customerName?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === this.filterStatus);
    }

    return filtered;
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

  logout(): void {
    this.router.navigate(['/login']);
  }
}


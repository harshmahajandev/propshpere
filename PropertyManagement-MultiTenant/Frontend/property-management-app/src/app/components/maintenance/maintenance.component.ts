import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance.service';
import { SupportTicket } from '../../models/maintenance.model';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  tickets: SupportTicket[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  filterStatus = 'all';
  filterPriority = 'all';
  sidenavOpened = true;

  constructor(
    private maintenanceService: MaintenanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';

    this.maintenanceService.getTickets().subscribe({
      next: (response) => {
        if (response.success) {
          this.tickets = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load tickets';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading tickets';
        this.loading = false;
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  addTicket(): void {
    // Navigate to add ticket form
  }

  editTicket(ticket: SupportTicket): void {
    // Navigate to edit ticket form
  }

  deleteTicket(ticket: SupportTicket): void {
    if (confirm(`Are you sure you want to delete ticket "${ticket.ticketNumber}"?`)) {
      this.maintenanceService.deleteTicket(ticket.id).subscribe({
        next: () => {
          this.loadTickets();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete ticket';
        }
      });
    }
  }

  get filteredTickets(): SupportTicket[] {
    let filtered = this.tickets;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.ticketNumber.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.customerName?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === this.filterPriority);
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

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}


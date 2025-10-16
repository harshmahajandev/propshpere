import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeadService } from '../../services/lead.service';
import { Lead, LeadSource, LeadStatus, Priority, LeadStats } from '../../models/lead.model';
import { LeadDialogComponent } from '../lead-dialog/lead-dialog.component';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  loading = false;
  errorMessage = '';
  
  // Filters
  searchQuery = '';
  filterStatus = 'all';
  filterSource = 'all';
  filterPriority = 'all';
  sortBy = 'date-desc';
  
  // Stats
  stats: LeadStats | null = null;
  
  // Enums for template
  leadStatuses = Object.values(LeadStatus);
  leadSources = Object.values(LeadSource);
  priorities = Object.values(Priority);

  constructor(
    private leadService: LeadService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLeads();
    this.loadStats();
  }

  loadLeads(): void {
    this.loading = true;
    this.errorMessage = '';

    // Use mock data for now
    setTimeout(() => {
      this.leads = this.getMockLeads();
      this.applyFilters();
      this.loading = false;
    }, 500);

    // When backend is ready:
    // this.leadService.getLeads().subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.leads = response.data;
    //       this.applyFilters();
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     this.errorMessage = 'Error loading leads';
    //     this.loading = false;
    //   }
    // });
  }

  loadStats(): void {
    // Mock stats for now
    this.stats = {
      totalLeads: 48,
      newLeads: 12,
      qualifiedLeads: 18,
      convertedLeads: 8,
      conversionRate: 16.7,
      averageResponseTime: 2.5,
      leadsThisMonth: 23,
      leadsGrowth: 15.2
    };
  }

  getMockLeads(): Lead[] {
    return [
      {
        id: '1',
        fullName: 'Ali Hassan',
        email: 'ali.hassan@email.com',
        phone: '+973 3912 3456',
        nationality: 'Bahraini',
        source: LeadSource.Website,
        status: LeadStatus.New,
        stage: 'New' as any,
        propertyInterest: 'Luxury Villa in Saar',
        propertyType: 'Villa' as any,
        budgetMin: 500000,
        budgetMax: 800000,
        location: 'Saar',
        bedrooms: 4,
        priority: Priority.High,
        score: 85,
        notes: 'Interested in properties with sea view',
        lastContactDate: new Date('2024-10-15'),
        nextFollowUpDate: new Date('2024-10-17'),
        conversionProbability: 75,
        tags: ['Hot Lead', 'VIP'],
        createdAt: new Date('2024-10-14'),
        companyId: ''
      },
      {
        id: '2',
        fullName: 'Fatima Al-Khalifa',
        email: 'fatima.k@email.com',
        phone: '+973 3823 4567',
        nationality: 'Bahraini',
        source: LeadSource.Facebook,
        status: LeadStatus.Contacted,
        stage: 'Contacted' as any,
        propertyInterest: 'Modern Apartment',
        propertyType: 'Apartment' as any,
        budgetMin: 200000,
        budgetMax: 350000,
        location: 'Juffair',
        bedrooms: 2,
        priority: Priority.Medium,
        score: 65,
        notes: 'First-time buyer, needs financing info',
        lastContactDate: new Date('2024-10-13'),
        nextFollowUpDate: new Date('2024-10-18'),
        conversionProbability: 60,
        tags: ['First Time Buyer'],
        createdAt: new Date('2024-10-10'),
        companyId: ''
      },
      {
        id: '3',
        fullName: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+973 3734 5678',
        nationality: 'British',
        source: LeadSource.Google,
        status: LeadStatus.Qualified,
        stage: 'Qualified' as any,
        propertyInterest: 'Commercial Space',
        propertyType: 'Office' as any,
        budgetMin: 1000000,
        budgetMax: 1500000,
        location: 'Seef',
        priority: Priority.High,
        score: 90,
        notes: 'Looking for office space for expanding business',
        lastContactDate: new Date('2024-10-12'),
        nextFollowUpDate: new Date('2024-10-16'),
        conversionProbability: 85,
        tags: ['Commercial', 'Corporate'],
        createdAt: new Date('2024-10-08'),
        companyId: ''
      },
      {
        id: '4',
        fullName: 'Sara Ahmed',
        email: 'sara.ahmed@email.com',
        phone: '+973 3645 7890',
        nationality: 'Bahraini',
        source: LeadSource.Referral,
        status: LeadStatus.New,
        stage: 'New' as any,
        propertyInterest: 'Investment Property',
        propertyType: 'Apartment' as any,
        budgetMin: 150000,
        budgetMax: 250000,
        location: 'Amwaj Islands',
        bedrooms: 1,
        priority: Priority.Medium,
        score: 70,
        notes: 'Investor looking for rental income property',
        lastContactDate: new Date('2024-10-16'),
        nextFollowUpDate: new Date('2024-10-19'),
        conversionProbability: 65,
        tags: ['Investor'],
        createdAt: new Date('2024-10-15'),
        companyId: ''
      },
      {
        id: '5',
        fullName: 'Ahmed Mohammed',
        email: 'ahmed.m@email.com',
        phone: '+973 3556 7891',
        nationality: 'Bahraini',
        source: LeadSource.WhatsApp,
        status: LeadStatus.Contacted,
        stage: 'Contacted' as any,
        propertyInterest: 'Family Villa',
        propertyType: 'Villa' as any,
        budgetMin: 400000,
        budgetMax: 600000,
        location: 'Riffa',
        bedrooms: 5,
        priority: Priority.High,
        score: 80,
        notes: 'Large family, needs spacious property',
        lastContactDate: new Date('2024-10-14'),
        nextFollowUpDate: new Date('2024-10-17'),
        conversionProbability: 70,
        tags: ['Family', 'Urgent'],
        createdAt: new Date('2024-10-11'),
        companyId: ''
      },
      {
        id: '6',
        fullName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+973 3467 8912',
        nationality: 'Spanish',
        source: LeadSource.Instagram,
        status: LeadStatus.New,
        stage: 'New' as any,
        propertyInterest: 'Beach Front Property',
        propertyType: 'Apartment' as any,
        budgetMin: 300000,
        budgetMax: 450000,
        location: 'Amwaj Islands',
        bedrooms: 2,
        priority: Priority.Low,
        score: 55,
        notes: 'Looking for vacation home',
        lastContactDate: new Date('2024-10-15'),
        nextFollowUpDate: new Date('2024-10-20'),
        conversionProbability: 50,
        tags: ['International'],
        createdAt: new Date('2024-10-14'),
        companyId: ''
      }
    ];
  }

  applyFilters(): void {
    let filtered = [...this.leads];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.fullName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.propertyInterest?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.filterStatus);
    }

    // Source filter
    if (this.filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === this.filterSource);
    }

    // Priority filter
    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(lead => lead.priority === this.filterPriority);
    }

    // Sorting
    filtered = this.sortLeads(filtered);

    this.filteredLeads = filtered;
  }

  sortLeads(leads: Lead[]): Lead[] {
    switch (this.sortBy) {
      case 'date-desc':
        return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-asc':
        return leads.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'score-desc':
        return leads.sort((a, b) => b.score - a.score);
      case 'score-asc':
        return leads.sort((a, b) => a.score - b.score);
      case 'name':
        return leads.sort((a, b) => a.fullName.localeCompare(b.fullName));
      default:
        return leads;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  addLead(): void {
    const dialogRef = this.dialog.open(LeadDialogComponent, {
      width: '800px',
      data: { lead: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLeads();
      }
    });
  }

  editLead(lead: Lead): void {
    const dialogRef = this.dialog.open(LeadDialogComponent, {
      width: '800px',
      data: { lead: lead, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLeads();
      }
    });
  }

  deleteLead(lead: Lead): void {
    if (confirm(`Are you sure you want to delete lead "${lead.fullName}"?`)) {
      this.leads = this.leads.filter(l => l.id !== lead.id);
      this.applyFilters();
      // this.leadService.deleteLead(lead.id).subscribe();
    }
  }

  convertToCustomer(lead: Lead): void {
    if (confirm(`Convert "${lead.fullName}" to customer?`)) {
      alert('Lead converted to customer successfully!');
      this.loadLeads();
      // this.leadService.convertLeadToCustomer(lead.id).subscribe();
    }
  }

  getStatusClass(status: LeadStatus): string {
    const classes: { [key: string]: string } = {
      [LeadStatus.New]: 'status-new',
      [LeadStatus.Contacted]: 'status-contacted',
      [LeadStatus.Qualified]: 'status-qualified',
      [LeadStatus.Unqualified]: 'status-unqualified',
      [LeadStatus.Converted]: 'status-converted',
      [LeadStatus.Lost]: 'status-lost'
    };
    return classes[status] || '';
  }

  getPriorityClass(priority: Priority): string {
    const classes: { [key: string]: string } = {
      [Priority.Low]: 'priority-low',
      [Priority.Medium]: 'priority-medium',
      [Priority.High]: 'priority-high',
      [Priority.Urgent]: 'priority-urgent'
    };
    return classes[priority] || '';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  exportLeads(): void {
    alert('Export functionality - Coming soon!');
  }

  importLeads(): void {
    alert('Import functionality - Coming soon!');
  }
}

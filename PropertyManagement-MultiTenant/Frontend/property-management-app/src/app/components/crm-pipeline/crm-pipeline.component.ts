import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LeadService } from '../../services/lead.service';
import { Lead, LeadStage, PipelineStats } from '../../models/lead.model';
import { LeadDialogComponent } from '../lead-dialog/lead-dialog.component';

interface PipelineColumn {
  stage: LeadStage;
  title: string;
  leads: Lead[];
  stats: {
    count: number;
    value: number;
    conversionRate: number;
  };
  color: string;
}

@Component({
  selector: 'app-crm-pipeline',
  templateUrl: './crm-pipeline.component.html',
  styleUrls: ['./crm-pipeline.component.scss']
})
export class CrmPipelineComponent implements OnInit {
  loading = false;
  errorMessage = '';
  
  pipelineColumns: PipelineColumn[] = [];
  
  totalLeads = 0;
  totalValue = 0;
  averageConversionRate = 0;

  constructor(
    private leadService: LeadService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializePipeline();
    this.loadLeads();
  }

  initializePipeline(): void {
    this.pipelineColumns = [
      {
        stage: LeadStage.New,
        title: 'New Leads',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#3b82f6'
      },
      {
        stage: LeadStage.Contacted,
        title: 'Contacted',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#f59e0b'
      },
      {
        stage: LeadStage.Qualified,
        title: 'Qualified',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#8b5cf6'
      },
      {
        stage: LeadStage.Proposal,
        title: 'Proposal',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#06b6d4'
      },
      {
        stage: LeadStage.Negotiation,
        title: 'Negotiation',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#ec4899'
      },
      {
        stage: LeadStage.ClosedWon,
        title: 'Closed Won',
        leads: [],
        stats: { count: 0, value: 0, conversionRate: 0 },
        color: '#10b981'
      }
    ];
  }

  loadLeads(): void {
    this.loading = true;
    this.errorMessage = '';

    // Use mock data for now
    setTimeout(() => {
      const allLeads = this.getMockLeads();
      this.distributeLeadsToColumns(allLeads);
      this.calculateStats();
      this.loading = false;
    }, 500);

    // When backend is ready:
    // this.leadService.getLeads().subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.distributeLeadsToColumns(response.data);
    //       this.calculateStats();
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     this.errorMessage = 'Error loading pipeline data';
    //     this.loading = false;
    //   }
    // });
  }

  getMockLeads(): Lead[] {
    return [
      {
        id: '1',
        fullName: 'Ali Hassan',
        email: 'ali.hassan@email.com',
        phone: '+973 3912 3456',
        source: 'Website' as any,
        status: 'New' as any,
        stage: LeadStage.New,
        propertyInterest: 'Luxury Villa',
        budgetMin: 500000,
        budgetMax: 800000,
        priority: 'High' as any,
        score: 85,
        conversionProbability: 75,
        createdAt: new Date('2024-10-14'),
        companyId: ''
      },
      {
        id: '2',
        fullName: 'Fatima Al-Khalifa',
        email: 'fatima.k@email.com',
        phone: '+973 3823 4567',
        source: 'Facebook' as any,
        status: 'Contacted' as any,
        stage: LeadStage.Contacted,
        propertyInterest: 'Modern Apartment',
        budgetMin: 200000,
        budgetMax: 350000,
        priority: 'Medium' as any,
        score: 65,
        conversionProbability: 60,
        createdAt: new Date('2024-10-10'),
        companyId: ''
      },
      {
        id: '3',
        fullName: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+973 3734 5678',
        source: 'Google' as any,
        status: 'Qualified' as any,
        stage: LeadStage.Qualified,
        propertyInterest: 'Commercial Space',
        budgetMin: 1000000,
        budgetMax: 1500000,
        priority: 'High' as any,
        score: 90,
        conversionProbability: 85,
        createdAt: new Date('2024-10-08'),
        companyId: ''
      },
      {
        id: '4',
        fullName: 'Sara Ahmed',
        email: 'sara.ahmed@email.com',
        phone: '+973 3645 7890',
        source: 'Referral' as any,
        status: 'Qualified' as any,
        stage: LeadStage.Proposal,
        propertyInterest: 'Investment Property',
        budgetMin: 150000,
        budgetMax: 250000,
        priority: 'Medium' as any,
        score: 70,
        conversionProbability: 65,
        createdAt: new Date('2024-10-15'),
        companyId: ''
      },
      {
        id: '5',
        fullName: 'Ahmed Mohammed',
        email: 'ahmed.m@email.com',
        phone: '+973 3556 7891',
        source: 'WhatsApp' as any,
        status: 'Contacted' as any,
        stage: LeadStage.Negotiation,
        propertyInterest: 'Family Villa',
        budgetMin: 400000,
        budgetMax: 600000,
        priority: 'High' as any,
        score: 80,
        conversionProbability: 70,
        createdAt: new Date('2024-10-11'),
        companyId: ''
      },
      {
        id: '6',
        fullName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+973 3467 8912',
        source: 'Instagram' as any,
        status: 'New' as any,
        stage: LeadStage.New,
        propertyInterest: 'Beach Front Property',
        budgetMin: 300000,
        budgetMax: 450000,
        priority: 'Low' as any,
        score: 55,
        conversionProbability: 50,
        createdAt: new Date('2024-10-14'),
        companyId: ''
      },
      {
        id: '7',
        fullName: 'Khalid Al-Mansoori',
        email: 'khalid.m@email.com',
        phone: '+973 3378 9123',
        source: 'Website' as any,
        status: 'Converted' as any,
        stage: LeadStage.ClosedWon,
        propertyInterest: 'Penthouse',
        budgetMin: 600000,
        budgetMax: 900000,
        priority: 'High' as any,
        score: 95,
        conversionProbability: 100,
        createdAt: new Date('2024-09-20'),
        companyId: ''
      }
    ];
  }

  distributeLeadsToColumns(leads: Lead[]): void {
    // Reset all columns
    this.pipelineColumns.forEach(col => col.leads = []);
    
    // Distribute leads to their respective columns
    leads.forEach(lead => {
      const column = this.pipelineColumns.find(col => col.stage === lead.stage);
      if (column) {
        column.leads.push(lead);
      }
    });
  }

  calculateStats(): void {
    this.totalLeads = 0;
    this.totalValue = 0;
    
    this.pipelineColumns.forEach(column => {
      column.stats.count = column.leads.length;
      column.stats.value = column.leads.reduce((sum, lead) => {
        const avgBudget = ((lead.budgetMin || 0) + (lead.budgetMax || 0)) / 2;
        return sum + avgBudget;
      }, 0);
      
      this.totalLeads += column.stats.count;
      this.totalValue += column.stats.value;
    });
    
    // Calculate conversion rates (mock data)
    const conversionRates = [100, 80, 60, 45, 30, 100];
    this.pipelineColumns.forEach((column, index) => {
      column.stats.conversionRate = conversionRates[index];
    });
    
    this.averageConversionRate = this.pipelineColumns
      .slice(0, -1) // Exclude ClosedWon
      .reduce((sum, col) => sum + col.stats.conversionRate, 0) / (this.pipelineColumns.length - 1);
  }

  viewLeadDetails(lead: Lead): void {
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

  getLeadAvatar(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  drop(event: CdkDragDrop<Lead[]>, targetColumn: PipelineColumn): void {
    if (event.previousContainer === event.container) {
      // Same column - reorder
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Different column - transfer
      const lead = event.previousContainer.data[event.previousIndex];
      
      // Update lead stage
      lead.stage = targetColumn.stage;
      
      // Transfer item
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update statistics
      this.calculateStats();
      
      // In production, update backend
      // this.leadService.updateLeadStage(lead.id, targetColumn.stage).subscribe();
      
      console.log(`Moved ${lead.fullName} to ${targetColumn.title}`);
    }
  }

  getConnectedLists(): string[] {
    return this.pipelineColumns.map((_, index) => `column-${index}`);
  }
}

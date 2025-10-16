import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus, Priority, ProjectStats } from '../../models/project.model';
import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  errorMessage = '';
  
  // Filters
  searchQuery = '';
  filterStatus = 'all';
  filterPriority = 'all';
  sortBy = 'date-desc';
  
  // Stats
  stats: ProjectStats | null = null;
  
  // Enums for template
  projectStatuses = Object.values(ProjectStatus);
  priorities = Object.values(Priority);

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadStats();
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    // Use mock data for now
    setTimeout(() => {
      this.projects = this.getMockProjects();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  loadStats(): void {
    this.stats = {
      totalProjects: 12,
      activeProjects: 7,
      completedProjects: 4,
      totalBudget: 2500000,
      totalSpent: 1850000,
      onTimeProjects: 8,
      delayedProjects: 2,
      averageCompletion: 68
    };
  }

  getMockProjects(): Project[] {
    return [
      {
        id: '1',
        name: 'Luxury Villa Renovation',
        description: 'Complete renovation of 5-bedroom luxury villa in Saar',
        projectCode: 'PRJ-2024-001',
        status: ProjectStatus.InProgress,
        priority: Priority.High,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31'),
        budget: 500000,
        spent: 325000,
        progress: 65,
        propertyName: 'Villa Saar 123',
        managerId: 'mgr1',
        managerName: 'Ahmed Al-Khalifa',
        teamMembers: ['tm1', 'tm2', 'tm3'],
        createdAt: new Date('2024-08-15'),
        companyId: ''
      },
      {
        id: '2',
        name: 'Commercial Complex Construction',
        description: 'New commercial building in Seef district',
        projectCode: 'PRJ-2024-002',
        status: ProjectStatus.InProgress,
        priority: Priority.Critical,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-06-30'),
        budget: 1500000,
        spent: 650000,
        progress: 42,
        propertyName: 'Seef Tower',
        managerId: 'mgr2',
        managerName: 'Sara Mohammed',
        teamMembers: ['tm4', 'tm5', 'tm6', 'tm7'],
        createdAt: new Date('2024-06-15'),
        companyId: ''
      },
      {
        id: '3',
        name: 'Apartment Complex Maintenance',
        description: 'Annual maintenance for Amwaj residences',
        projectCode: 'PRJ-2024-003',
        status: ProjectStatus.Planning,
        priority: Priority.Medium,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-01-31'),
        budget: 150000,
        spent: 0,
        progress: 15,
        propertyName: 'Amwaj Residences',
        managerId: 'mgr1',
        managerName: 'Ahmed Al-Khalifa',
        teamMembers: ['tm1', 'tm2'],
        createdAt: new Date('2024-10-01'),
        companyId: ''
      },
      {
        id: '4',
        name: 'Marina Development Phase 2',
        description: 'Second phase of marina development project',
        projectCode: 'PRJ-2024-004',
        status: ProjectStatus.Completed,
        priority: Priority.High,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-09-30'),
        budget: 800000,
        spent: 775000,
        progress: 100,
        propertyName: 'Bahrain Marina',
        managerId: 'mgr3',
        managerName: 'Fatima Hassan',
        teamMembers: ['tm8', 'tm9', 'tm10'],
        createdAt: new Date('2023-12-01'),
        companyId: ''
      }
    ];
  }

  applyFilters(): void {
    let filtered = [...this.projects];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.projectCode.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === this.filterStatus);
    }

    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(project => project.priority === this.filterPriority);
    }

    filtered = this.sortProjects(filtered);
    this.filteredProjects = filtered;
  }

  sortProjects(projects: Project[]): Project[] {
    switch (this.sortBy) {
      case 'date-desc':
        return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-asc':
        return projects.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'progress-desc':
        return projects.sort((a, b) => b.progress - a.progress);
      case 'progress-asc':
        return projects.sort((a, b) => a.progress - b.progress);
      case 'name':
        return projects.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return projects;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  addProject(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '900px',
      data: { project: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  editProject(project: Project): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '900px',
      data: { project: project, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  viewProject(project: Project): void {
    this.router.navigate(['/project-detail', project.id]);
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projects = this.projects.filter(p => p.id !== project.id);
      this.applyFilters();
    }
  }

  getStatusClass(status: ProjectStatus): string {
    const classes: { [key: string]: string } = {
      [ProjectStatus.Planning]: 'status-planning',
      [ProjectStatus.InProgress]: 'status-progress',
      [ProjectStatus.OnHold]: 'status-hold',
      [ProjectStatus.Completed]: 'status-completed',
      [ProjectStatus.Cancelled]: 'status-cancelled'
    };
    return classes[status] || '';
  }

  getPriorityClass(priority: Priority): string {
    const classes: { [key: string]: string } = {
      [Priority.Low]: 'priority-low',
      [Priority.Medium]: 'priority-medium',
      [Priority.High]: 'priority-high',
      [Priority.Critical]: 'priority-critical'
    };
    return classes[priority] || '';
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#6b7280';
  }
}

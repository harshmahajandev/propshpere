import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../services/project.service';
import { Project, Milestone, Task, MilestoneStatus, TaskStatus } from '../../models/project.model';
import { MilestoneDialogComponent } from '../milestone-dialog/milestone-dialog.component';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  project: Project | null = null;
  milestones: Milestone[] = [];
  independentTasks: Task[] = [];
  loading = false;
  errorMessage = '';
  
  activeTab = 0; // 0 = Overview, 1 = Milestones, 2 = Tasks

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.loadProjectData();
    });
  }

  loadProjectData(): void {
    this.loading = true;
    // Mock data for now
    setTimeout(() => {
      this.project = this.getMockProject();
      this.milestones = this.getMockMilestones();
      this.independentTasks = this.getMockIndependentTasks();
      this.loading = false;
    }, 500);
  }

  getMockProject(): Project {
    return {
      id: this.projectId,
      name: 'Luxury Villa Renovation',
      description: 'Complete renovation of 5-bedroom luxury villa in Saar including interior design, landscaping, and smart home integration',
      projectCode: 'PRJ-2024-001',
      status: 'In Progress' as any,
      priority: 'High' as any,
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
    };
  }

  getMockMilestones(): Milestone[] {
    return [
      {
        id: 'm1',
        projectId: this.projectId,
        name: 'Foundation & Structure',
        description: 'Structural work and foundation repairs',
        status: MilestoneStatus.Completed,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
        progress: 100,
        order: 1,
        tasks: [
          {
            id: 't1',
            projectId: this.projectId,
            milestoneId: 'm1',
            title: 'Foundation inspection',
            status: TaskStatus.Done,
            priority: 'High' as any,
            assignedToName: 'Ali Hassan',
            dueDate: new Date('2024-09-10'),
            estimatedHours: 40,
            createdAt: new Date('2024-09-01')
          },
          {
            id: 't2',
            projectId: this.projectId,
            milestoneId: 'm1',
            title: 'Structural reinforcement',
            status: TaskStatus.Done,
            priority: 'Critical' as any,
            assignedToName: 'Mohammed Ali',
            dueDate: new Date('2024-09-25'),
            estimatedHours: 80,
            createdAt: new Date('2024-09-05')
          }
        ],
        createdAt: new Date('2024-08-15')
      },
      {
        id: 'm2',
        projectId: this.projectId,
        name: 'Interior Work',
        description: 'Interior design and finishing',
        status: MilestoneStatus.InProgress,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-11-15'),
        progress: 60,
        order: 2,
        tasks: [
          {
            id: 't3',
            projectId: this.projectId,
            milestoneId: 'm2',
            title: 'Paint walls',
            status: TaskStatus.InProgress,
            priority: 'Medium' as any,
            assignedToName: 'Sara Ahmed',
            dueDate: new Date('2024-10-20'),
            estimatedHours: 60,
            createdAt: new Date('2024-10-01')
          },
          {
            id: 't4',
            projectId: this.projectId,
            milestoneId: 'm2',
            title: 'Install fixtures',
            status: TaskStatus.Todo,
            priority: 'High' as any,
            assignedToName: 'Fatima Ali',
            dueDate: new Date('2024-11-10'),
            estimatedHours: 40,
            createdAt: new Date('2024-10-01')
          }
        ],
        createdAt: new Date('2024-09-20')
      },
      {
        id: 'm3',
        projectId: this.projectId,
        name: 'Landscaping',
        description: 'Outdoor area development',
        status: MilestoneStatus.NotStarted,
        startDate: new Date('2024-11-16'),
        endDate: new Date('2024-12-15'),
        progress: 0,
        order: 3,
        tasks: [],
        createdAt: new Date('2024-09-25')
      }
    ];
  }

  getMockIndependentTasks(): Task[] {
    return [
      {
        id: 't5',
        projectId: this.projectId,
        title: 'Obtain building permits',
        description: 'Get all necessary permits from municipality',
        status: TaskStatus.Done,
        priority: 'Critical' as any,
        assignedToName: 'Ahmed Al-Khalifa',
        dueDate: new Date('2024-09-05'),
        estimatedHours: 20,
        createdAt: new Date('2024-08-20')
      },
      {
        id: 't6',
        projectId: this.projectId,
        title: 'Order smart home equipment',
        description: 'Purchase smart home automation system',
        status: TaskStatus.InProgress,
        priority: 'High' as any,
        assignedToName: 'Sara Ahmed',
        dueDate: new Date('2024-10-25'),
        estimatedHours: 10,
        createdAt: new Date('2024-10-10')
      }
    ];
  }

  // Milestone Actions
  addMilestone(): void {
    const dialogRef = this.dialog.open(MilestoneDialogComponent, {
      width: '700px',
      data: { milestone: null, projectId: this.projectId, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjectData();
      }
    });
  }

  editMilestone(milestone: Milestone): void {
    const dialogRef = this.dialog.open(MilestoneDialogComponent, {
      width: '700px',
      data: { milestone: milestone, projectId: this.projectId, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjectData();
      }
    });
  }

  deleteMilestone(milestone: Milestone): void {
    if (confirm(`Delete milestone "${milestone.name}"? This will also delete all tasks under it.`)) {
      this.milestones = this.milestones.filter(m => m.id !== milestone.id);
    }
  }

  // Task Actions
  addTask(milestone?: Milestone): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '700px',
      data: { 
        task: null, 
        projectId: this.projectId, 
        milestoneId: milestone?.id || null,
        mode: 'create' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjectData();
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '700px',
      data: { 
        task: task, 
        projectId: this.projectId,
        milestoneId: task.milestoneId || null,
        mode: 'edit' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjectData();
      }
    });
  }

  deleteTask(task: Task, milestone?: Milestone): void {
    if (confirm(`Delete task "${task.title}"?`)) {
      if (milestone && milestone.tasks) {
        milestone.tasks = milestone.tasks.filter(t => t.id !== task.id);
      } else {
        this.independentTasks = this.independentTasks.filter(t => t.id !== task.id);
      }
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Not Started': 'status-not-started',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Delayed': 'status-delayed',
      'To Do': 'status-todo',
      'In Review': 'status-review',
      'Done': 'status-done',
      'Blocked': 'status-blocked'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Critical': 'priority-critical'
    };
    return priorityMap[priority] || '';
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  projectCode: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  budget?: number;
  spent?: number;
  progress: number; // 0-100
  propertyId?: string;
  propertyName?: string;
  managerId: string;
  managerName?: string;
  teamMembers?: string[];
  milestones?: Milestone[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt?: Date;
  companyId: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  order: number;
  tasks?: Task[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string; // Optional - task can exist without milestone
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  assignedToName?: string;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export enum ProjectStatus {
  Planning = 'Planning',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum MilestoneStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Delayed = 'Delayed'
}

export enum TaskStatus {
  Todo = 'To Do',
  InProgress = 'In Progress',
  Review = 'In Review',
  Done = 'Done',
  Blocked = 'Blocked'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface ProjectFormData {
  name: string;
  description?: string;
  projectCode: string;
  status: string;
  priority: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  propertyId?: string;
  managerId: string;
  teamMembers?: string[];
}

export interface MilestoneFormData {
  name: string;
  description?: string;
  status: string;
  startDate: Date;
  endDate: Date;
  order: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  milestoneId?: string;
  assignedTo?: string;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  onTimeProjects: number;
  delayedProjects: number;
  averageCompletion: number;
}


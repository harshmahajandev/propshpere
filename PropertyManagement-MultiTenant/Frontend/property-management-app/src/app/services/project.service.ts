import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { 
  Project, 
  Milestone, 
  Task, 
  ProjectFormData, 
  MilestoneFormData, 
  TaskFormData,
  ProjectStats 
} from '../models/project.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Project APIs
  getProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl);
  }

  getProjectById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  createProject(project: ProjectFormData): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, project);
  }

  updateProject(id: string, project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getProjectStats(): Observable<ApiResponse<ProjectStats>> {
    return this.http.get<ApiResponse<ProjectStats>>(`${this.apiUrl}/stats`);
  }

  // Milestone APIs
  getMilestones(projectId: string): Observable<ApiResponse<Milestone[]>> {
    return this.http.get<ApiResponse<Milestone[]>>(`${this.apiUrl}/${projectId}/milestones`);
  }

  createMilestone(projectId: string, milestone: MilestoneFormData): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.apiUrl}/${projectId}/milestones`, milestone);
  }

  updateMilestone(projectId: string, milestoneId: string, milestone: Partial<Milestone>): Observable<ApiResponse<Milestone>> {
    return this.http.put<ApiResponse<Milestone>>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}`, milestone);
  }

  deleteMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}`);
  }

  // Task APIs
  getTasks(projectId: string, milestoneId?: string): Observable<ApiResponse<Task[]>> {
    const url = milestoneId 
      ? `${this.apiUrl}/${projectId}/milestones/${milestoneId}/tasks`
      : `${this.apiUrl}/${projectId}/tasks`;
    return this.http.get<ApiResponse<Task[]>>(url);
  }

  createTask(projectId: string, task: TaskFormData): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${projectId}/tasks`, task);
  }

  updateTask(projectId: string, taskId: string, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, task);
  }

  deleteTask(projectId: string, taskId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${projectId}/tasks/${taskId}`);
  }

  updateTaskStatus(projectId: string, taskId: string, status: string): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${projectId}/tasks/${taskId}/status`, { status });
  }
}


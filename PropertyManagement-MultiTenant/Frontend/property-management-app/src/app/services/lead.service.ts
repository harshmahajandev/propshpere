import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Lead, LeadFormData, LeadStats, PipelineStats } from '../models/lead.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(): Observable<ApiResponse<Lead[]>> {
    return this.http.get<ApiResponse<Lead[]>>(this.apiUrl);
  }

  getLeadById(id: string): Observable<ApiResponse<Lead>> {
    return this.http.get<ApiResponse<Lead>>(`${this.apiUrl}/${id}`);
  }

  createLead(lead: LeadFormData): Observable<ApiResponse<Lead>> {
    return this.http.post<ApiResponse<Lead>>(this.apiUrl, lead);
  }

  updateLead(id: string, lead: Partial<Lead>): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.apiUrl}/${id}`, lead);
  }

  deleteLead(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  updateLeadStage(id: string, stage: string): Observable<ApiResponse<Lead>> {
    return this.http.patch<ApiResponse<Lead>>(`${this.apiUrl}/${id}/stage`, { stage });
  }

  convertLeadToCustomer(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/convert`, {});
  }

  addLeadActivity(leadId: string, activity: any): Observable<ApiResponse<Lead>> {
    return this.http.post<ApiResponse<Lead>>(`${this.apiUrl}/${leadId}/activities`, activity);
  }

  getLeadStats(): Observable<ApiResponse<LeadStats>> {
    return this.http.get<ApiResponse<LeadStats>>(`${this.apiUrl}/stats`);
  }

  getPipelineStats(): Observable<ApiResponse<PipelineStats[]>> {
    return this.http.get<ApiResponse<PipelineStats[]>>(`${this.apiUrl}/pipeline-stats`);
  }

  assignLead(leadId: string, userId: string): Observable<ApiResponse<Lead>> {
    return this.http.patch<ApiResponse<Lead>>(`${this.apiUrl}/${leadId}/assign`, { userId });
  }

  bulkImportLeads(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bulk-import`, formData);
  }

  exportLeads(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, filters, { responseType: 'blob' });
  }
}


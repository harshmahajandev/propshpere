import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupportTicket, TicketFormData } from '../models/maintenance.model';
import { ApiResponse } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/supporttickets`;

  constructor(private http: HttpClient) {}

  getTickets(): Observable<ApiResponse<SupportTicket[]>> {
    return this.http.get<ApiResponse<SupportTicket[]>>(this.apiUrl);
  }

  getTicket(id: string): Observable<ApiResponse<SupportTicket>> {
    return this.http.get<ApiResponse<SupportTicket>>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticket: TicketFormData): Observable<ApiResponse<SupportTicket>> {
    return this.http.post<ApiResponse<SupportTicket>>(this.apiUrl, ticket);
  }

  updateTicket(id: string, ticket: TicketFormData): Observable<ApiResponse<SupportTicket>> {
    return this.http.put<ApiResponse<SupportTicket>>(`${this.apiUrl}/${id}`, ticket);
  }

  deleteTicket(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}


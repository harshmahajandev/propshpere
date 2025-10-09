import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceFormData } from '../models/invoice.model';
import { ApiResponse } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(this.apiUrl);
  }

  getInvoice(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: InvoiceFormData): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, invoice);
  }

  updateInvoice(id: string, invoice: InvoiceFormData): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}


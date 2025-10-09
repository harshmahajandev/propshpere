import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, PropertyFormData, ApiResponse } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(this.apiUrl);
  }

  getProperty(id: string): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.apiUrl}/${id}`);
  }

  createProperty(property: PropertyFormData): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(this.apiUrl, property);
  }

  updateProperty(id: string, property: PropertyFormData): Observable<ApiResponse<Property>> {
    return this.http.put<ApiResponse<Property>>(`${this.apiUrl}/${id}`, property);
  }

  deleteProperty(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}


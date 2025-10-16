import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import {
  LoginRequest,
  LoginResponse,
  User,
  CompanyRegistrationRequest,
  CompanyRegistrationResponse,
  ApiResponse
} from '../models/auth.model';
import { Resource, Action } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Store token and user in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  registerCompany(request: CompanyRegistrationRequest): Observable<CompanyRegistrationResponse> {
    return this.http.post<CompanyRegistrationResponse>(
      `${this.apiUrl}/auth/register-company`,
      request
    );
  }

  validateCompanyCode(companyCode: string): Observable<ApiResponse<{ isValid: boolean; companyCode: string }>> {
    return this.http.get<ApiResponse<{ isValid: boolean; companyCode: string }>>(
      `${this.apiUrl}/auth/validate-company-code/${companyCode}`
    );
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/me`);
  }

  // Role and Permission Management
  hasPermission(resource: Resource, action: Action): boolean {
    const user = this.currentUserValue;
    if (!user || !user.permissions) return false;

    return user.permissions.some((permission: any) => 
      permission.resource === resource && permission.action === action
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;

    return user.roles.some((role: any) => role.name === roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;

    return user.roles.some((role: any) => roleNames.includes(role.name));
  }

  hasAllRoles(roleNames: string[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;

    return roleNames.every(roleName => 
      user.roles!.some((role: any) => role.name === roleName)
    );
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isManager(): boolean {
    return this.hasRole('manager');
  }

  isAgent(): boolean {
    return this.hasRole('agent');
  }

  isViewer(): boolean {
    return this.hasRole('viewer');
  }

  canManageUsers(): boolean {
    return this.hasPermission(Resource.USERS, Action.MANAGE) || this.isAdmin();
  }

  canViewUsers(): boolean {
    return this.hasPermission(Resource.USERS, Action.VIEW) || this.isAdmin();
  }

  canCreateUsers(): boolean {
    return this.hasPermission(Resource.USERS, Action.CREATE) || this.isAdmin();
  }

  canEditUsers(): boolean {
    return this.hasPermission(Resource.USERS, Action.EDIT) || this.isAdmin();
  }

  canDeleteUsers(): boolean {
    return this.hasPermission(Resource.USERS, Action.DELETE) || this.isAdmin();
  }

  // Refresh user data with latest roles and permissions
  refreshUserData(): Observable<User> {
    return this.getCurrentUser().pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      }),
      map(response => response.data)
    );
  }
}


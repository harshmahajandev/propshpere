import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  User, 
  UserRole, 
  Permission, 
  CreateUserRequest, 
  UpdateUserRequest, 
  ChangePasswordRequest,
  UserFilter,
  Resource,
  Action
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private rolesUrl = `${environment.apiUrl}/roles`;
  private permissionsUrl = `${environment.apiUrl}/permissions`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private rolesSubject = new BehaviorSubject<UserRole[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // User Management
  getUsers(filter?: UserFilter): Observable<User[]> {
    let params = new HttpParams();
    
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.roleId) {
      params = params.set('roleId', filter.roleId);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }
    if (filter?.organizationId) {
      params = params.set('organizationId', filter.organizationId);
    }

    return this.http.get<User[]>(this.apiUrl, { params })
      .pipe(
        tap(users => this.usersSubject.next(users))
      );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData)
      .pipe(
        tap(user => {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([...currentUsers, user]);
        })
      );
  }

  updateUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userData.id}`, userData)
      .pipe(
        tap(updatedUser => {
          const currentUsers = this.usersSubject.value;
          const index = currentUsers.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            currentUsers[index] = updatedUser;
            this.usersSubject.next([...currentUsers]);
          }
        })
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next(currentUsers.filter(u => u.id !== id));
        })
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, passwordData);
  }

  resetPassword(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/reset-password`, {});
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { isActive })
      .pipe(
        tap(updatedUser => {
          const currentUsers = this.usersSubject.value;
          const index = currentUsers.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            currentUsers[index] = updatedUser;
            this.usersSubject.next([...currentUsers]);
          }
        })
      );
  }

  // Role Management
  getRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.rolesUrl)
      .pipe(
        tap(roles => this.rolesSubject.next(roles))
      );
  }

  getRoleById(id: string): Observable<UserRole> {
    return this.http.get<UserRole>(`${this.rolesUrl}/${id}`);
  }

  createRole(roleData: Partial<UserRole>): Observable<UserRole> {
    return this.http.post<UserRole>(this.rolesUrl, roleData)
      .pipe(
        tap(role => {
          const currentRoles = this.rolesSubject.value;
          this.rolesSubject.next([...currentRoles, role]);
        })
      );
  }

  updateRole(id: string, roleData: Partial<UserRole>): Observable<UserRole> {
    return this.http.put<UserRole>(`${this.rolesUrl}/${id}`, roleData)
      .pipe(
        tap(updatedRole => {
          const currentRoles = this.rolesSubject.value;
          const index = currentRoles.findIndex(r => r.id === updatedRole.id);
          if (index !== -1) {
            currentRoles[index] = updatedRole;
            this.rolesSubject.next([...currentRoles]);
          }
        })
      );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentRoles = this.rolesSubject.value;
          this.rolesSubject.next(currentRoles.filter(r => r.id !== id));
        })
      );
  }

  // Permission Management
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionsUrl)
      .pipe(
        tap(permissions => this.permissionsSubject.next(permissions))
      );
  }

  // Permission Checking
  hasPermission(resource: Resource, action: Action): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    return currentUser.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  hasRole(roleName: string): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    return currentUser.roles.some(role => role.name === roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    return currentUser.roles.some(role => roleNames.includes(role.name));
  }

  // Current User Management
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }

  updateCurrentUser(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }

  // Utility Methods
  private loadInitialData(): void {
    this.getRoles().subscribe();
    this.getPermissions().subscribe();
  }

  // Mock Data for Development
  getMockUsers(): User[] {
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@propsphere.com',
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        phone: '+1-555-0100',
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: 'org-1',
        roles: [
          {
            id: '1',
            name: 'admin',
            displayName: 'Administrator',
            description: 'Full system access',
            isSystemRole: true,
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permissions: []
      },
      {
        id: '2',
        username: 'manager1',
        email: 'manager@propsphere.com',
        firstName: 'John',
        lastName: 'Manager',
        fullName: 'John Manager',
        phone: '+1-555-0101',
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: 'org-1',
        roles: [
          {
            id: '2',
            name: 'manager',
            displayName: 'Manager',
            description: 'Property and customer management',
            isSystemRole: false,
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permissions: []
      },
      {
        id: '3',
        username: 'agent1',
        email: 'agent@propsphere.com',
        firstName: 'Jane',
        lastName: 'Agent',
        fullName: 'Jane Agent',
        phone: '+1-555-0102',
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: 'org-1',
        roles: [
          {
            id: '3',
            name: 'agent',
            displayName: 'Agent',
            description: 'Basic property and customer access',
            isSystemRole: false,
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permissions: []
      }
    ];
  }

  getMockRoles(): UserRole[] {
    return [
      {
        id: '1',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access including user management',
        isSystemRole: true,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'manager',
        displayName: 'Manager',
        description: 'Property and customer management access',
        isSystemRole: false,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'agent',
        displayName: 'Agent',
        description: 'Basic property and customer access',
        isSystemRole: false,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to most features',
        isSystemRole: false,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

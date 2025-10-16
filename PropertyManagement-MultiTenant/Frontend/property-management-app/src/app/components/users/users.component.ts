import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserRole, UserFilter, UserStatus, Resource, Action } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: UserRole[] = [];
  filteredUsers: User[] = [];
  
  // Enums for template access
  Resource = Resource;
  Action = Action;
  
  // Filters
  searchTerm = '';
  selectedRoleId = '';
  selectedStatus: UserStatus | '' = '';
  showInactive = false;
  
  // View mode
  viewMode: 'grid' | 'list' = 'grid';
  
  // Loading states
  isLoading = false;
  
  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalUsers = 0;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    const filter: UserFilter = {
      search: this.searchTerm || undefined,
      roleId: this.selectedRoleId || undefined,
      status: this.selectedStatus || undefined,
      isActive: this.showInactive ? undefined : true
    };

    // For development, use mock data
    this.users = this.userService.getMockUsers();
    this.filteredUsers = [...this.users];
    this.totalUsers = this.users.length;
    this.isLoading = false;

    // In production, use this:
    // this.userService.getUsers(filter).subscribe({
    //   next: (users) => {
    //     this.users = users;
    //     this.filteredUsers = [...users];
    //     this.totalUsers = users.length;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading users:', error);
    //     this.isLoading = false;
    //   }
    // });
  }

  loadRoles(): void {
    // For development, use mock data
    this.roles = this.userService.getMockRoles();

    // In production, use this:
    // this.userService.getRoles().subscribe(roles => {
    //   this.roles = roles;
    // });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onShowInactiveChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (this.selectedRoleId) {
      filtered = filtered.filter(user => 
        user.roles.some(role => role.id === this.selectedRoleId)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(user => {
        if (this.selectedStatus === UserStatus.ACTIVE) return user.isActive;
        if (this.selectedStatus === UserStatus.INACTIVE) return !user.isActive;
        return true;
      });
    }

    // Inactive filter
    if (!this.showInactive) {
      filtered = filtered.filter(user => user.isActive);
    }

    this.filteredUsers = filtered;
    this.totalUsers = filtered.length;
    this.currentPage = 0;
  }

  openCreateDialog(): void {
    if (!this.hasPermission(Resource.USERS, Action.CREATE)) {
      this.snackBar.open('You do not have permission to create users', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'create', roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(user: User): void {
    if (!this.hasPermission(Resource.USERS, Action.EDIT)) {
      this.snackBar.open('You do not have permission to edit users', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user, roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (!this.hasPermission(Resource.USERS, Action.DELETE)) {
      this.snackBar.open('You do not have permission to delete users', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    if (!this.hasPermission(Resource.USERS, Action.EDIT)) {
      this.snackBar.open('You do not have permission to modify users', 'Close', { duration: 3000 });
      return;
    }

    this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.applyFilters();
        }
        this.snackBar.open(
          `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`, 
          'Close', 
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  resetPassword(user: User): void {
    if (!this.hasPermission(Resource.USERS, Action.MANAGE)) {
      this.snackBar.open('You do not have permission to reset passwords', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Reset password for user "${user.fullName}"?`)) {
      this.userService.resetPassword(user.id).subscribe({
        next: () => {
          this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error resetting password:', error);
          this.snackBar.open('Error resetting password', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getRoleDisplayName(roleId: string): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.displayName : 'Unknown Role';
  }

  getStatusColor(status: boolean): string {
    return status ? 'primary' : 'warn';
  }

  getStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  hasPermission(resource: Resource, action: Action): boolean {
    return this.userService.hasPermission(resource, action);
  }

  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  get paginatedUsers(): User[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}

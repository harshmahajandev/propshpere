import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
  roles: UserRole[];
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting = false;
  mode: 'create' | 'edit';
  user?: User;
  roles: UserRole[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.mode = data.mode;
    this.user = data.user;
    this.roles = data.roles;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      password: ['', this.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []],
      confirmPassword: ['', this.mode === 'create' ? [Validators.required] : []],
      roleIds: [[], [Validators.required]],
      isActive: [true]
    });

    if (this.mode === 'edit' && this.user) {
      this.userForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone || '',
        roleIds: this.user.roles.map(role => role.id),
        isActive: this.user.isActive
      });

      // Remove password validators for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    }

    // Add custom password confirmation validator
    this.userForm.addValidators(this.passwordMatchValidator);
  }

  passwordMatchValidator = (control: any) => {
    const form = control as FormGroup;
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  };

  onSubmit(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      if (this.mode === 'create') {
        this.createUser();
      } else {
        this.updateUser();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createUser(): void {
    const formValue = this.userForm.value;
    const userData: CreateUserRequest = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone || undefined,
      password: formValue.password,
      roleIds: formValue.roleIds,
      isActive: formValue.isActive
    };

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.dialogRef.close(user);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isSubmitting = false;
      }
    });
  }

  updateUser(): void {
    if (!this.user) return;

    const formValue = this.userForm.value;
    const userData: UpdateUserRequest = {
      id: this.user.id,
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone || undefined,
      roleIds: formValue.roleIds,
      isActive: formValue.isActive
    };

    this.userService.updateUser(userData).subscribe({
      next: (user) => {
        this.dialogRef.close(user);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
    }
    
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      roleIds: 'Roles',
      isActive: 'Active Status'
    };
    
    return fieldNames[fieldName] || fieldName;
  }

  get isFormValid(): boolean {
    return this.userForm.valid && !this.isSubmitting;
  }

  get isCreateMode(): boolean {
    return this.mode === 'create';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
}

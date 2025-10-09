import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  companyCode = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('RegisterComponent initialized');
    this.registerForm = this.formBuilder.group({
      // Company Information
      companyName: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(500)],
      industry: ['', Validators.maxLength(200)],
      contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      contactPhone: ['', Validators.maxLength(20)],
      address: ['', Validators.maxLength(500)],
      city: ['', Validators.maxLength(100)],
      country: ['', Validators.maxLength(100)],
      
      // Admin User Information
      adminFirstName: ['', [Validators.required, Validators.maxLength(100)]],
      adminLastName: ['', [Validators.required, Validators.maxLength(100)]],
      adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      adminUsername: ['', [Validators.required, Validators.maxLength(100)]],
      adminPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      adminPasswordConfirm: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
    console.log('RegisterForm initialized:', this.registerForm);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('adminPassword');
    const confirmPassword = form.get('adminPasswordConfirm');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerCompany(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.companyCode = response.data.companyCode;
          this.successMessage = response.message || 'Company registered successfully!';
          this.registerForm.reset();
          
          // Show success message for 5 seconds then redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred during registration. Please try again.';
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (fieldName === 'adminPasswordConfirm' && field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}


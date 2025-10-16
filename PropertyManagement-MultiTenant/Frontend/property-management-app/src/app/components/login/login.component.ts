import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize form first
    this.loginForm = this.formBuilder.group({
      companyCode: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Login failed';
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
        this.loading = false;
      }
    });
  }

  // Demo login without backend
  demoLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    // Create a demo user object
    const demoUser: User = {
      id: 'demo-user-001',
      username: 'demo',
      email: 'demo@diyar.com',
      firstName: 'Demo',
      lastName: 'User',
      fullName: 'Demo User',
      role: 'Admin',
      companyId: 'demo-company-001',
      companyName: 'Diyar Properties',
      companyCode: 'DEMO2024'
    };

    // Simulate login with demo credentials
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      this.loading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}


export interface LoginRequest {
  companyCode: string;
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    expiresAt: string;
    user: User;
  };
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  companyId: string;
  companyName: string;
  companyCode: string;
}

export interface CompanyRegistrationRequest {
  companyName: string;
  description?: string;
  industry?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

export interface CompanyRegistrationResponse {
  success: boolean;
  data: {
    companyId: string;
    companyName: string;
    companyCode: string;
    message: string;
    adminUser: User;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


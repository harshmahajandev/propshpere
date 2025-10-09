# 🏢 Multi-Tenant Property Management System

A comprehensive, enterprise-grade property management system built with **Angular**, **.NET 8 Web API**, and **SQL Server** featuring robust multi-tenant architecture.

## 🎯 Overview

This system is a complete replication of the Diyar Property Management System with enhanced multi-tenant capabilities, allowing multiple companies to use the same application with strict data isolation and security.

### Key Features

- ✅ **Multi-Tenant Architecture** - Complete data isolation per company
- ✅ **Company Registration** - Self-service company onboarding with unique codes
- ✅ **Custom Authentication** - Login with Company Code + Username + Password
- ✅ **Property Management** - Comprehensive property portfolio management
- ✅ **CRM & Lead Management** - AI-enhanced customer relationship management
- ✅ **Reservations** - Property booking and reservation system
- ✅ **Financial Management** - Invoicing and financial tracking
- ✅ **Customer Portal** - Customer-facing interface
- ✅ **Analytics Dashboard** - Real-time business insights

---

## 🏗️ Architecture

### Backend (.NET 8 Web API)

```
PropertyManagement-MultiTenant/Backend/
├── PropertyManagement.API          # Web API Layer
├── PropertyManagement.Application  # Business Logic Layer
├── PropertyManagement.Core         # Domain Entities & Interfaces
└── PropertyManagement.Infrastructure  # Data Access & Services
```

### Frontend (Angular)

```
PropertyManagement-MultiTenant/Frontend/
└── property-management-app/
    ├── src/
    │   ├── app/
    │   │   ├── core/              # Core services & guards
    │   │   ├── shared/            # Shared components & modules
    │   │   ├── features/          # Feature modules
    │   │   └── auth/              # Authentication module
    │   └── assets/                # Static assets
    └── angular.json
```

### Database (SQL Server)

- **Multi-Tenant Design**: All tenant data tables include `CompanyId` foreign key
- **Identity Management**: ASP.NET Core Identity with custom user model
- **Global Query Filters**: Automatic data filtering by tenant
- **Data Isolation**: Zero data leakage between companies

---

## 🚀 Getting Started

### Prerequisites

- **SQL Server** (2019 or later) / SQL Server Express
- **.NET 8 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **Node.js** (v18 or later) & **npm**
- **Angular CLI** (`npm install -g @angular/cli`)
- **Visual Studio 2022** or **VS Code** (recommended)

### Backend Setup

#### 1. Database Configuration

Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=PropertyManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

For SQL Server Authentication:
```json
"DefaultConnection": "Server=YOUR_SERVER;Database=PropertyManagementDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
```

#### 2. Create Database & Run Migrations

Navigate to the backend directory:

```bash
cd Backend

# Create initial migration
dotnet ef migrations add InitialCreate --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API

# Apply migration to database
dotnet ef database update --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API
```

#### 3. Run the API

```bash
cd PropertyManagement.API
dotnet run
```

The API will start at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `https://localhost:5001` (Development only)

---

## 📋 API Endpoints

### Authentication

#### Company Registration
```http
POST /api/auth/register-company
Content-Type: application/json

{
  "companyName": "Acme Real Estate",
  "description": "Leading real estate company",
  "industry": "Real Estate",
  "contactEmail": "admin@acme.com",
  "contactPhone": "+973-1234-5678",
  "address": "123 Main Street",
  "city": "Manama",
  "country": "Bahrain",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminEmail": "john@acme.com",
  "adminUsername": "johndoe",
  "adminPassword": "SecurePass123",
  "adminPasswordConfirm": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "guid",
    "companyName": "Acme Real Estate",
    "companyCode": "ACME5678",
    "message": "Company registered successfully! Your unique company code is: ACME5678. Please save this code as it will be required for login.",
    "adminUser": {
      "id": "guid",
      "username": "johndoe",
      "email": "john@acme.com",
      "role": "Admin",
      ...
    }
  }
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "companyCode": "ACME5678",
  "username": "johndoe",
  "password": "SecurePass123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2025-10-10T12:00:00Z",
    "user": {
      "id": "guid",
      "username": "johndoe",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "Admin",
      "companyId": "guid",
      "companyName": "Acme Real Estate",
      "companyCode": "ACME5678"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 🔐 Multi-Tenant Security

### How It Works

1. **Company Registration**
   - Company registers and receives a unique `CompanyCode` (e.g., "ACME5678")
   - Admin user is automatically created for the company
   - All data is associated with the `CompanyId`

2. **User Authentication**
   - Users must provide: Company Code + Username + Password
   - JWT token includes `CompanyId` and `CompanyCode` claims
   - Token is used for all subsequent API calls

3. **Data Isolation**
   - All queries are automatically filtered by `CompanyId`
   - Global query filters ensure users only see their company's data
   - No cross-tenant data leakage is possible

4. **Request Flow**
```
User Login → Validate Company Code → Validate User Credentials
    ↓
Generate JWT Token (includes CompanyId claim)
    ↓
API Request with Token → Extract CompanyId from Token
    ↓
Auto-filter all queries by CompanyId → Return only tenant's data
```

---

## 🗄️ Database Schema

### Core Tables

#### Companies
- `Id` (PK, Guid)
- `CompanyName`
- `CompanyCode` (Unique Index)
- `ContactEmail`, `ContactPhone`
- `SubscriptionPlan`, `SubscriptionEndDate`
- `MaxUsers`, `MaxProperties`
- `IsActive`

#### Users (ApplicationUser)
- `Id` (PK, Guid)
- `UserName`, `Email`, `PasswordHash`
- `FirstName`, `LastName`
- `CompanyId` (FK to Companies)
- `Role` (Admin, Manager, SalesRep, User, Customer)
- `IsActive`

#### Properties (Tenant-Isolated)
- `Id` (PK, Guid)
- `CompanyId` (FK to Companies) ← **Tenant Key**
- `Title`, `Description`
- `PropertyType`, `Status`
- `Price`, `Size`, `Bedrooms`, `Bathrooms`
- `Location`, `Project`, `Island`
- `CreatedById` (FK to Users)

#### Leads (Tenant-Isolated)
- `Id` (PK, Guid)
- `CompanyId` (FK to Companies) ← **Tenant Key**
- `FirstName`, `LastName`, `Email`, `Phone`
- `BuyerType`, `Status`, `Score`
- `BudgetMin`, `BudgetMax`
- `AssignedToId` (FK to Users)

#### Reservations (Tenant-Isolated)
- `Id` (PK, Guid)
- `CompanyId` (FK to Companies) ← **Tenant Key**
- `PropertyId` (FK to Properties)
- `CustomerName`, `CustomerEmail`
- `Status`, `DepositAmount`
- `ReservationDate`, `HoldDuration`

*All tenant-isolated tables follow the same pattern with `CompanyId` foreign key.*

---

## 👥 User Roles & Permissions

### Admin
- Full access to all company data
- User management (invite/add users)
- Company settings management
- All features access

### Manager
- View all company data
- Create/edit properties and leads
- Manage reservations
- View analytics

### Sales Representative
- View assigned leads
- Create/edit properties
- Create reservations
- Limited analytics

### User
- Basic access
- View properties
- Limited features

### Customer
- Customer portal access
- View own reservations
- View own data only

---

## 🛠️ Development

### Backend Development

```bash
# Run API
dotnet run --project PropertyManagement.API

# Run with watch (auto-reload)
dotnet watch run --project PropertyManagement.API

# Run tests
dotnet test

# Create new migration
dotnet ef migrations add MigrationName --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API

# Update database
dotnet ef database update --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API
```

### Frontend Development (Coming Next)

```bash
# Install dependencies
cd Frontend/property-management-app
npm install

# Run development server
ng serve

# Build for production
ng build --configuration production
```

---

## 📊 Sample Data

The system includes one demo company:

**Company Details:**
- Company Name: Demo Real Estate Company
- Company Code: `DEMO2024`
- Industry: Real Estate
- Location: Manama, Bahrain

**Demo Admin User** (will be created after first login):
- Username: Create via registration
- Password: Your chosen password

---

## 🔧 Configuration

### JWT Settings (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyHere-ChangeInProduction",
    "Issuer": "PropertyManagementAPI",
    "Audience": "PropertyManagementClient",
    "ExpiryHours": 24
  }
}
```

⚠️ **Important**: Change the `SecretKey` in production!

### CORS Settings

By default, CORS is configured to allow:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (Alternative port)

Update in `Program.cs` for production:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("https://your-production-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: Cannot connect to SQL Server

**Solutions**:
1. Verify SQL Server is running: `services.msc`
2. Check connection string in `appsettings.json`
3. Enable TCP/IP in SQL Server Configuration Manager
4. Add firewall exception for SQL Server port (default: 1433)
5. For Windows Authentication, ensure your Windows user has access

### Migration Issues

**Error**: Build failed / Entity Framework Tools not found

**Solutions**:
```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef

# Update EF Core tools
dotnet tool update --global dotnet-ef

# Verify installation
dotnet ef --version
```

### Authentication Issues

**Error**: Unauthorized (401)

**Solutions**:
1. Verify company code is correct
2. Check username/password
3. Ensure user is active (`IsActive = true`)
4. Verify JWT token is included in Authorization header
5. Check token hasn't expired

---

## 📚 Technology Stack

### Backend
- **.NET 8** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core 9** - ORM
- **SQL Server** - Database
- **ASP.NET Core Identity** - Authentication
- **JWT Bearer** - Token-based auth
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **Swashbuckle** - Swagger/OpenAPI

### Frontend (Coming)
- **Angular 18** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Angular Material** - UI components
- **RxJS** - Reactive programming
- **Chart.js** - Data visualization
- **Angular Forms** - Form management

---

## 📈 Features Roadmap

### ✅ Completed
- Multi-tenant architecture
- Company registration
- Authentication system
- Database schema & migrations
- Core API endpoints
- Swagger documentation

### 🚧 In Progress
- Angular frontend
- Property management UI
- Lead/CRM management
- Dashboard analytics

### 📋 Planned
- User management UI
- Financial reports
- Email notifications
- SMS integration
- Mobile app (React Native)
- Advanced analytics & AI features

---

## 🤝 Contributing

This is a proprietary project for specific client requirements. For questions or support:

**Contact**: Your Development Team

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🎯 Quick Start Checklist

- [ ] Install SQL Server
- [ ] Install .NET 8 SDK
- [ ] Clone repository
- [ ] Update connection string
- [ ] Run database migrations
- [ ] Start API (`dotnet run`)
- [ ] Test Swagger UI
- [ ] Register test company
- [ ] Test login endpoint
- [ ] Verify JWT token generation
- [ ] Install Node.js & Angular CLI (for frontend)
- [ ] Run Angular app (when available)

---

**Built with ❤️ using .NET 8 & Angular**


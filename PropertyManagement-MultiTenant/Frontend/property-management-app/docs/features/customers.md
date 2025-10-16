# Customer Management Feature

## Overview
Customer relationship management system for property management.

## Components
- **Customers List** (`/customers`) - View all customers
- **Customer Dialog** - Create/edit customers

## Features

### Customer Management
- Add, edit, and delete customers
- Customer type management (Individual/Corporate)
- Risk level assessment
- Contact information management
- Linked user accounts

### Search & Filter
- Search customers
- Filter by type and risk level
- Sort customers
- View customer details

## Data Model
```typescript
interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  type: CustomerType;
  riskLevel: RiskLevel;
  linkedUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Customer Types
- Individual
- Corporate

## Risk Levels
- Low
- Medium
- High

## Usage

### Adding a Customer
1. Navigate to Customers page
2. Click "Add Customer" button
3. Fill in customer details
4. Select customer type
5. Set risk level
6. Save customer

### Managing Customers
1. Search for specific customers
2. Filter by type or risk level
3. View customer details
4. Edit or delete as needed

## Integration
- Links to user accounts
- Property association
- Invoice generation
- Maintenance requests

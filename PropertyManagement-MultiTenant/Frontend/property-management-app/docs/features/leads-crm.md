# Leads & CRM Feature

## Overview
Comprehensive lead management system with CRM pipeline functionality.

## Components
- **Leads List** (`/leads`) - View and manage all leads
- **CRM Pipeline** (`/crm-pipeline`) - Drag & drop lead management

## Features

### Lead Management
- Create, edit, and delete leads
- Search and filter leads
- Lead status tracking
- Priority management
- Source tracking

### CRM Pipeline
- Drag & drop between stages
- Visual pipeline representation
- Stage-based statistics
- Lead progression tracking

## Data Model
```typescript
interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  stage: LeadStage;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage

### Adding a Lead
1. Navigate to Leads page
2. Click "Add Lead" button
3. Fill in lead details
4. Select source, status, and priority
5. Save lead

### Managing Pipeline
1. Navigate to CRM Pipeline
2. Drag leads between stages
3. View stage statistics
4. Track lead progression

## API Endpoints
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `PUT /api/leads/:id/stage` - Update lead stage

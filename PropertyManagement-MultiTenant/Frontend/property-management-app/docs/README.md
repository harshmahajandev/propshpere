# Property Management System Documentation

## Overview
A comprehensive property management system built with Angular, featuring modern UI design and multiple management modules.

## Features

### Core Features
- **Dashboard** - Analytics and overview
- **Properties** - Property portfolio management
- **Customers** - Customer relationship management
- **Invoices** - Billing and payment tracking
- **Maintenance** - Property maintenance management

### Advanced Features
- **Leads & CRM** - Lead management with pipeline
- **Project Management** - Project, milestone, and task management
- **Analytics** - Data visualization and reporting

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (v15 or higher)

### Installation
```bash
npm install
ng serve
```

### Access
- URL: http://localhost:4200
- Default credentials: admin/admin

## Documentation Structure

### Feature Documentation
- [Leads & CRM](./features/leads-crm.md)
- [Project Management](./features/project-management.md)
- [Properties Management](./features/properties.md)
- [Customer Management](./features/customers.md)

### User Guides
- [Getting Started](./guides/getting-started.md)
- [UI Components](./guides/ui-components.md)
- [Navigation Guide](./guides/navigation.md)

## Technical Details

### Architecture
- **Frontend**: Angular 15 with Material Design
- **State Management**: Services with RxJS
- **Styling**: SCSS with Material Design 3 tokens
- **Routing**: Angular Router with guards

### Key Components
- Layout with responsive sidebar
- Role-based access control
- Drag & drop functionality
- Modern card-based UI
- Form validation and dialogs

## Development

### Project Structure
```
src/
├── app/
│   ├── components/     # Feature components
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── guards/         # Route guards
│   └── interceptors/   # HTTP interceptors
├── assets/             # Static assets
└── styles.scss         # Global styles
```

### Adding New Features
1. Create component in `src/app/components/`
2. Add model in `src/app/models/`
3. Create service in `src/app/services/`
4. Update routing in `app-routing.module.ts`
5. Add navigation in `layout.component.ts`

## Support
For questions or issues, please refer to the specific feature documentation or contact the development team.

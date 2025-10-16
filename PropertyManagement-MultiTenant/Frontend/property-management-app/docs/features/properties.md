# Properties Management Feature

## Overview
Complete property portfolio management system.

## Components
- **Properties List** (`/properties`) - View all properties
- **Property Dialog** - Create/edit properties

## Features

### Property Management
- Add, edit, and delete properties
- Property details management
- Image gallery
- Status tracking
- Type categorization

### Search & Filter
- Search by name, address, or city
- Filter by status and type
- Sort properties
- Grid and list view modes

## Data Model
```typescript
interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  price: number;
  description: string;
  images: string[];
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Property Types
- Apartment
- House
- Condo
- Townhouse
- Commercial

## Property Status
- Available
- Rented
- Maintenance
- Sold

## Usage

### Adding a Property
1. Navigate to Properties page
2. Click "Add Property" button
3. Fill in property details
4. Upload images
5. Set amenities
6. Save property

### Managing Properties
1. Use search to find properties
2. Filter by status or type
3. Switch between grid and list views
4. Edit or delete properties as needed

## View Modes
- **Grid View** - Card-based layout with images
- **List View** - Table-based layout with details

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyFormData, PropertyStatus } from '../../models/property.model';
import { PropertyDialogComponent } from './property-dialog.component';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = false;
  viewMode: 'grid' | 'table' = 'grid';
  
  // Form and Dialog
  showDialog = false;
  isEditMode = false;
  propertyForm!: FormGroup;
  selectedProperty: Property | null = null;

  // Filters
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';

  // Table columns
  displayedColumns: string[] = ['name', 'type', 'address', 'price', 'status', 'actions'];

  propertyTypes = ['Apartment', 'Villa', 'Commercial', 'Land', 'Penthouse'];
  propertyStatuses = ['Available', 'Rented', 'Sold', 'Maintenance'];

  constructor(
    private propertyService: PropertyService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProperties();
  }

  initializeForm(): void {
    this.propertyForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      propertyType: ['', Validators.required],
      address: ['', Validators.maxLength(500)],
      location: ['', Validators.maxLength(200)],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['BHD', Validators.required],
      size: [0, [Validators.required, Validators.min(0)]],
      bedrooms: [0, Validators.min(0)],
      bathrooms: [0, Validators.min(0)],
      status: [PropertyStatus.Available, Validators.required],
      project: [''],
      island: ['']
    });
  }

  loadProperties(): void {
    this.loading = true;
    
    // For now, use mock data since backend might not be ready
    setTimeout(() => {
      this.properties = this.getMockProperties();
      this.filteredProperties = [...this.properties];
      this.loading = false;
    }, 500);

    // When backend is ready, use this:
    // this.propertyService.getProperties().subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.properties = response.data;
    //       this.applyFilters();
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading properties:', error);
    //     this.loading = false;
    //   }
    // });
  }

  getMockProperties(): Property[] {
    return [
      {
        id: '1',
        title: 'Luxury Villa Downtown',
        description: 'Beautiful 4-bedroom villa in prime location',
        propertyType: 'Villa',
        address: '123 Main Street',
        location: 'Dubai',
        price: 850000,
        currency: 'BHD',
        size: 325,
        bedrooms: 4,
        bathrooms: 3,
        status: PropertyStatus.Available,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'],
        interestScore: 0,
        viewCount: 0,
        inquiryCount: 0,
        createdById: '',
        companyId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Modern Apartment',
        description: '2-bedroom apartment with city view',
        propertyType: 'Apartment',
        address: '456 Park Avenue',
        location: 'Abu Dhabi',
        price: 450000,
        currency: 'BHD',
        size: 111,
        bedrooms: 2,
        bathrooms: 2,
        status: PropertyStatus.Rented,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
        interestScore: 0,
        viewCount: 0,
        inquiryCount: 0,
        createdById: '',
        companyId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        title: 'Commercial Space',
        description: 'Prime commercial property for business',
        propertyType: 'Commercial',
        address: '789 Business Bay',
        location: 'Dubai',
        price: 1200000,
        currency: 'BHD',
        size: 465,
        bedrooms: 0,
        bathrooms: 3,
        status: PropertyStatus.Available,
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'],
        interestScore: 0,
        viewCount: 0,
        inquiryCount: 0,
        createdById: '',
        companyId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        title: 'Beachfront Penthouse',
        description: 'Luxurious penthouse with ocean views',
        propertyType: 'Apartment',
        address: '321 Beach Road',
        location: 'Dubai',
        price: 2500000,
        currency: 'BHD',
        size: 418,
        bedrooms: 5,
        bathrooms: 4,
        status: PropertyStatus.Available,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'],
        interestScore: 0,
        viewCount: 0,
        inquiryCount: 0,
        createdById: '',
        companyId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter(property => {
      const matchesSearch = !this.searchTerm || 
        property.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (property.address && property.address.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (property.location && property.location.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = this.statusFilter === 'all' || property.status === this.statusFilter;
      const matchesType = this.typeFilter === 'all' || property.propertyType === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PropertyDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { property: null },
      panelClass: 'property-dialog',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProperty(result);
      }
    });
  }

  openEditDialog(property: Property): void {
    const dialogRef = this.dialog.open(PropertyDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { property: property },
      panelClass: 'property-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProperty(result);
      }
    });
  }

  createProperty(formData: any): void {
    const newProperty: Property = {
      ...formData,
      id: 'prop-' + Date.now(),
      images: [],
      companyId: 'demo-company',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.properties.unshift(newProperty);
    this.applyFilters();
    
    this.snackBar.open('✅ Property created successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  updateProperty(formData: any): void {
    const index = this.properties.findIndex(p => p.id === formData.id);
    if (index !== -1) {
      this.properties[index] = {
        ...this.properties[index],
        ...formData,
        updatedAt: new Date()
      };
      this.applyFilters();
      
      this.snackBar.open('✅ Property updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.propertyForm.reset();
    this.selectedProperty = null;
  }

  saveProperty(): void {
    // Handled by Material Dialog now
  }

  deleteProperty(property: Property): void {
    if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
      this.properties = this.properties.filter(p => p.id !== property.id);
      this.applyFilters();
      
      this.snackBar.open('🗑️ Property deleted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Available': '#10b981',
      'Rented': '#f59e0b',
      'Sold': '#ef4444',
      'Maintenance': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  getFieldError(fieldName: string): string {
    const field = this.propertyForm.get(fieldName);
    
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min')) return 'Value must be greater than 0';
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    
    return '';
  }

  hasError(fieldName: string): boolean {
    const field = this.propertyForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Property, PropertyStatus } from '../../models/property.model';

@Component({
  selector: 'app-property-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.property ? 'edit' : 'add' }}</mat-icon>
      {{ data.property ? 'Edit Property' : 'Add New Property' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="propertyForm" class="property-form">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Property Title</mat-label>
            <input matInput formControlName="title">
            <mat-icon matPrefix>home</mat-icon>
            <mat-hint>e.g., Luxury Penthouse Downtown</mat-hint>
            <mat-error *ngIf="propertyForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Property Type</mat-label>
            <mat-select formControlName="propertyType">
              <mat-option value="Apartment">Apartment</mat-option>
              <mat-option value="Villa">Villa</mat-option>
              <mat-option value="Commercial">Commercial</mat-option>
              <mat-option value="Land">Land</mat-option>
              <mat-option value="Penthouse">Penthouse</mat-option>
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
            <mat-error *ngIf="propertyForm.get('propertyType')?.hasError('required')">
              Type is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Available">Available</mat-option>
              <mat-option value="Rented">Rented</mat-option>
              <mat-option value="Sold">Sold</mat-option>
              <mat-option value="Maintenance">Maintenance</mat-option>
            </mat-select>
            <mat-icon matPrefix>info</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            <mat-icon matPrefix>description</mat-icon>
            <mat-hint>Describe the property features and amenities</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address">
            <mat-icon matPrefix>location_on</mat-icon>
            <mat-hint>Full street address</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Location/City</mat-label>
            <input matInput formControlName="location">
            <mat-icon matPrefix>place</mat-icon>
            <mat-hint>e.g., Manama, Riffa</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Currency</mat-label>
            <mat-select formControlName="currency">
              <mat-option value="BHD">BHD</mat-option>
              <mat-option value="USD">USD</mat-option>
              <mat-option value="AED">AED</mat-option>
            </mat-select>
            <mat-icon matPrefix>attach_money</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price">
            <span matPrefix>{{propertyForm.get('currency')?.value}}&nbsp;</span>
            <mat-hint>Property price or rent amount</mat-hint>
            <mat-error *ngIf="propertyForm.get('price')?.hasError('required')">
              Price is required
            </mat-error>
            <mat-error *ngIf="propertyForm.get('price')?.hasError('min')">
              Price must be positive
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Bedrooms</mat-label>
            <input matInput type="number" formControlName="bedrooms">
            <mat-icon matPrefix>bed</mat-icon>
            <mat-hint>Number of bedrooms</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Bathrooms</mat-label>
            <input matInput type="number" formControlName="bathrooms">
            <mat-icon matPrefix>bathtub</mat-icon>
            <mat-hint>Number of bathrooms</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Size (sqm)</mat-label>
            <input matInput type="number" formControlName="size">
            <mat-icon matPrefix>square_foot</mat-icon>
            <mat-hint>Total area in square meters</mat-hint>
            <mat-error *ngIf="propertyForm.get('size')?.hasError('required')">
              Size is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project</mat-label>
            <input matInput formControlName="project">
            <mat-icon matPrefix>business</mat-icon>
            <mat-hint>Associated project (optional)</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Island</mat-label>
            <input matInput formControlName="island">
            <mat-icon matPrefix>landscape</mat-icon>
            <mat-hint>Island location (optional)</mat-hint>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="propertyForm.invalid">
        <mat-icon>{{ data.property ? 'save' : 'add' }}</mat-icon>
        {{ data.property ? 'Update Property' : 'Create Property' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .property-form {
      padding-top: var(--space-4);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      
      .full-width {
        grid-column: 1 / -1;
      }
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    h2 {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: 22px;
      font-weight: 700;
      color: white;
      background: var(--gradient-primary);
      margin: 0;
      padding: var(--space-6);
      
      mat-icon {
        background: rgba(255,255,255,0.2);
        padding: 6px;
        border-radius: var(--radius-md);
      }
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: var(--space-6) !important;
    }

    mat-dialog-actions {
      padding: var(--space-5) var(--space-6) !important;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
      gap: var(--space-3);
      
      button {
        mat-icon {
          margin-right: var(--space-2);
        }
      }
    }
    
    // Better hint styling
    ::ng-deep .mat-mdc-form-field-hint {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
      padding-top: 4px;
    }
    
    // Prefix icon spacing
    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding-right: 8px;
      color: #6b7280;
    }
  `]
})
export class PropertyDialogComponent implements OnInit {
  propertyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { property?: Property }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.data.property) {
      this.propertyForm.patchValue(this.data.property);
    }
  }

  initializeForm(): void {
    this.propertyForm = this.fb.group({
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

  onSave(): void {
    if (this.propertyForm.valid) {
      const formData = this.propertyForm.value;
      
      if (this.data.property) {
        // Update mode - include all property data
        this.dialogRef.close({ 
          ...this.data.property,
          ...formData,
          id: this.data.property.id 
        });
      } else {
        // Create mode
        this.dialogRef.close(formData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.propertyForm.controls).forEach(key => {
        this.propertyForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


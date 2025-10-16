import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lead, LeadSource, Priority, PropertyType, LeadStage } from '../../models/lead.model';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-dialog',
  templateUrl: './lead-dialog.component.html',
  styleUrls: ['./lead-dialog.component.scss']
})
export class LeadDialogComponent implements OnInit {
  leadForm: FormGroup;
  mode: 'create' | 'edit';
  lead: Lead | null;
  
  // Enums for dropdowns
  leadSources = Object.values(LeadSource);
  priorities = Object.values(Priority);
  propertyTypes = Object.values(PropertyType);
  leadStages = Object.values(LeadStage);
  
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    public dialogRef: MatDialogRef<LeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lead: Lead | null; mode: 'create' | 'edit' }
  ) {
    this.lead = data.lead;
    this.mode = data.mode;
    
    this.leadForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      secondaryPhone: [''],
      nationality: [''],
      source: [LeadSource.Website, Validators.required],
      priority: [Priority.Medium, Validators.required],
      stage: [LeadStage.New, Validators.required],
      propertyInterest: [''],
      propertyType: [''],
      budgetMin: [''],
      budgetMax: [''],
      location: [''],
      bedrooms: [''],
      notes: [''],
      nextFollowUpDate: [''],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.lead) {
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.lead) {
      this.leadForm.patchValue({
        fullName: this.lead.fullName,
        email: this.lead.email,
        phone: this.lead.phone,
        secondaryPhone: this.lead.secondaryPhone,
        nationality: this.lead.nationality,
        source: this.lead.source,
        priority: this.lead.priority,
        stage: this.lead.stage,
        propertyInterest: this.lead.propertyInterest,
        propertyType: this.lead.propertyType,
        budgetMin: this.lead.budgetMin,
        budgetMax: this.lead.budgetMax,
        location: this.lead.location,
        bedrooms: this.lead.bedrooms,
        notes: this.lead.notes,
        nextFollowUpDate: this.lead.nextFollowUpDate,
        tags: this.lead.tags || []
      });
    }
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.markFormGroupTouched(this.leadForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.leadForm.value;

    if (this.mode === 'create') {
      // Mock creation for now
      console.log('Creating lead:', formData);
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);

      // When backend is ready:
      // this.leadService.createLead(formData).subscribe({
      //   next: (response) => {
      //     if (response.success) {
      //       this.dialogRef.close(true);
      //     }
      //     this.loading = false;
      //   },
      //   error: (error) => {
      //     this.errorMessage = 'Error creating lead';
      //     this.loading = false;
      //   }
      // });
    } else {
      // Mock update for now
      console.log('Updating lead:', this.lead?.id, formData);
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);

      // When backend is ready:
      // this.leadService.updateLead(this.lead!.id, formData).subscribe({
      //   next: (response) => {
      //     if (response.success) {
      //       this.dialogRef.close(true);
      //     }
      //     this.loading = false;
      //   },
      //   error: (error) => {
      //     this.errorMessage = 'Error updating lead';
      //     this.loading = false;
      //   }
      // });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    
    return '';
  }
}

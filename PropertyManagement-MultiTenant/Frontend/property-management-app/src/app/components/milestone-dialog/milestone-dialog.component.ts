import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Milestone, MilestoneStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-milestone-dialog',
  templateUrl: './milestone-dialog.component.html',
  styleUrls: ['./milestone-dialog.component.scss']
})
export class MilestoneDialogComponent implements OnInit {
  milestoneForm: FormGroup;
  mode: 'create' | 'edit';
  milestone: Milestone | null;
  projectId: string;
  
  milestoneStatuses = Object.values(MilestoneStatus);
  
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<MilestoneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      milestone: Milestone | null; 
      projectId: string;
      mode: 'create' | 'edit' 
    }
  ) {
    this.milestone = data.milestone;
    this.projectId = data.projectId;
    this.mode = data.mode;
    
    this.milestoneForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: [MilestoneStatus.NotStarted, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      order: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.milestone) {
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.milestone) {
      this.milestoneForm.patchValue({
        name: this.milestone.name,
        description: this.milestone.description,
        status: this.milestone.status,
        startDate: this.milestone.startDate,
        endDate: this.milestone.endDate,
        order: this.milestone.order
      });
    }
  }

  onSubmit(): void {
    if (this.milestoneForm.invalid) {
      this.markFormGroupTouched(this.milestoneForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.milestoneForm.value;

    if (this.mode === 'create') {
      console.log('Creating milestone:', formData);
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);
    } else {
      console.log('Updating milestone:', this.milestone?.id, formData);
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);
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
    const field = this.milestoneForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.milestoneForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('min')) {
      return 'Must be at least 1';
    }
    
    return '';
  }
}

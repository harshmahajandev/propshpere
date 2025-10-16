import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project, ProjectStatus, Priority } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent implements OnInit {
  projectForm: FormGroup;
  mode: 'create' | 'edit';
  project: Project | null;
  
  // Enums for dropdowns
  projectStatuses = Object.values(ProjectStatus);
  priorities = Object.values(Priority);
  
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project | null; mode: 'create' | 'edit' }
  ) {
    this.project = data.project;
    this.mode = data.mode;
    
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      projectCode: ['', Validators.required],
      status: [ProjectStatus.Planning, Validators.required],
      priority: [Priority.Medium, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: [''],
      propertyId: [''],
      managerId: ['', Validators.required],
      teamMembers: [[]]
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.project) {
      this.populateForm();
    } else {
      // Generate project code for new projects
      this.projectForm.patchValue({
        projectCode: this.generateProjectCode()
      });
    }
  }

  populateForm(): void {
    if (this.project) {
      this.projectForm.patchValue({
        name: this.project.name,
        description: this.project.description,
        projectCode: this.project.projectCode,
        status: this.project.status,
        priority: this.project.priority,
        startDate: this.project.startDate,
        endDate: this.project.endDate,
        budget: this.project.budget,
        propertyId: this.project.propertyId,
        managerId: this.project.managerId,
        teamMembers: this.project.teamMembers || []
      });
    }
  }

  generateProjectCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRJ-${year}-${random}`;
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.projectForm.value;

    if (this.mode === 'create') {
      // Mock creation
      console.log('Creating project:', formData);
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);
    } else {
      // Mock update
      console.log('Updating project:', this.project?.id, formData);
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
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.projectForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    return '';
  }
}

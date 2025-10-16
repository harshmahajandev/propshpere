import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task, TaskStatus, Priority } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
  taskForm: FormGroup;
  mode: 'create' | 'edit';
  task: Task | null;
  projectId: string;
  milestoneId: string | null;
  
  taskStatuses = Object.values(TaskStatus);
  priorities = Object.values(Priority);
  
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      task: Task | null; 
      projectId: string;
      milestoneId: string | null;
      mode: 'create' | 'edit' 
    }
  ) {
    this.task = data.task;
    this.projectId = data.projectId;
    this.milestoneId = data.milestoneId;
    this.mode = data.mode;
    
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.Todo, Validators.required],
      priority: [Priority.Medium, Validators.required],
      assignedTo: [''],
      startDate: [''],
      dueDate: [''],
      estimatedHours: [''],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.task) {
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        priority: this.task.priority,
        assignedTo: this.task.assignedTo,
        startDate: this.task.startDate,
        dueDate: this.task.dueDate,
        estimatedHours: this.task.estimatedHours,
        tags: this.task.tags || []
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = {
      ...this.taskForm.value,
      milestoneId: this.milestoneId // Will be null if task is independent
    };

    if (this.mode === 'create') {
      console.log('Creating task:', formData);
      console.log('Milestone ID:', this.milestoneId ? this.milestoneId : 'Independent task');
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(true);
      }, 500);
    } else {
      console.log('Updating task:', this.task?.id, formData);
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
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    return '';
  }

  get isIndependentTask(): boolean {
    return this.milestoneId === null;
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { CustomersComponent } from './components/customers/customers.component';
import { LeadsComponent } from './components/leads/leads.component';
import { CrmPipelineComponent } from './components/crm-pipeline/crm-pipeline.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { UsersComponent } from './components/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'properties', component: PropertiesComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'project-detail/:id', component: ProjectDetailComponent },
      { path: 'leads', component: LeadsComponent },
      { path: 'crm-pipeline', component: CrmPipelineComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'analytics', component: AnalyticsComponent, data: { roles: ['Admin', 'Manager'] } },
      { 
        path: 'users', 
        component: UsersComponent
        // Temporarily disabled role guard for development
        // canActivate: [RoleGuard],
        // data: { 
        //   roles: ['admin', 'manager'],
        //   permission: { resource: 'users', action: 'view' }
        // } 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { CustomersComponent } from './components/customers/customers.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AuthGuard } from './guards/auth.guard';

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
      { path: 'customers', component: CustomersComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'analytics', component: AnalyticsComponent, data: { roles: ['Admin', 'Manager'] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

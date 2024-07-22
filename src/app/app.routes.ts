import { Routes } from '@angular/router';
import { EmployeeComponent } from './pages/customer/employee/employee.component';
import { ItemComponent } from './pages/item/item/item.component';
import { OrderComponent } from './pages/order/order/order.component';

export const routes: Routes = [
  { path: 'customers', component: EmployeeComponent },
  { path: 'items', component: ItemComponent },
  { path: 'orders', component: OrderComponent },
  { path: '', redirectTo: '/items', pathMatch: 'full' },
];

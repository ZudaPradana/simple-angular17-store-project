import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeService } from '../../../services/employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { GetAllData } from '../../shared/models/Employee';
import { CommonModule } from '@angular/common';
import { DetailCustomerPageComponent } from '../detail-customer-page/detail-customer-page.component';
import { ModelComponent } from '../../shared/ui/model/model.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    DetailCustomerPageComponent,
    ModelComponent,
    EmployeeFormComponent,
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnInit, OnDestroy {
  isModalFormOpen = false;
  isModalDetilOpen = false;
  customers: any[] = [];
  customer!: any;
  editedItem: any = {};
  showDeleteConfirmation = false;
  currentPage = 1; // Current page
  pageSize = 10; // Items per page

  private readonly destroy$ = new Subject<void>();
  private readonly refreshData$ = new Subject<void>();

  trackByCustomerId(index: number, customer: any): number {
    return customer.customerId; // Return unique ID for each item
  }

  constructor(
    private employeeService: EmployeeService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getAllCustomers());
    this.refreshData$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Pagination Methods
  nextPage(): void {
    this.currentPage++;
    this.refreshData$.next();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refreshData$.next();
    }
  }

  getAllCustomers(): void {
    this.employeeService
      .getAllCustomers(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: GetAllData) => {
          if (response.header) {
            this.customers = response.data;
            this.cdr.detectChanges(); // Trigger change detection after data update
          }
        },
        error: (error: any) => {
          console.error('Error fetching customers', error);
          this.toastr.error('Error fetching customers');
        },
      });
  }

  loadCustomer(customer: any): void {
    this.customer = customer;
    this.openModalForm();
  }

  openModalDetil(customer: any): void {
    const customerId = customer.customerId;
    this.employeeService.getCustomerById(customerId).subscribe({
      next: (response) => {
        if (response.header.status) {
          this.customer = response.data;
          this.isModalDetilOpen = true;
          this.isModalFormOpen = false;
          this.cdr.detectChanges(); // Trigger change detection after opening modal
        } else {
          this.toastr.error(
            'Failed to load customer details: ' + response.header.message
          );
        }
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
        this.toastr.error('Error fetching customer details');
      },
    });
  }

  openModalForm(): void {
    this.isModalFormOpen = true;
    this.cdr.detectChanges(); // Trigger change detection after opening modal
  }

  closeModal(): void {
    this.isModalFormOpen = false;
    this.isModalDetilOpen = false;
    this.refreshData$.next();
    this.cdr.detectChanges(); // Trigger change detection after closing modal
  }

  deleteCustomer(id: string): void {
    this.employeeService.deleteCustomer(id).subscribe({
      next: (response) => {
        if (response && response.code === '200') {
          this.toastr.success('Customer deleted successfully');
          this.refreshData$.next();
          window.location.reload(); // Reload the page after successful deletion
        } else {
          this.toastr.error('Failed to delete item: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error deleting customer', error);
        this.toastr.error(
          'Cannot delete customer. Data is linked to other records.'
        );
      },
    });
  }

  confirmDelete(): void {
    if (this.editedItem) {
      const itemId = this.editedItem.customerId;
      this.deleteCustomer(itemId);
      this.showDeleteConfirmation = false;
      this.cdr.detectChanges(); // Trigger change detection after confirming delete
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.cdr.detectChanges(); // Trigger change detection after canceling delete
  }
}

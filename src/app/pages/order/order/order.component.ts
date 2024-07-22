import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ItemService } from '../../../services/item/item.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  GetAllData,
  GetData,
  HeaderResponse,
} from '../../shared/models/Employee';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ModelComponent } from '../../shared/ui/model/model.component';
import { OrderService } from '../../../services/order/order.service';
import { DetailOrderPageComponent } from '../detail-order-page/detail-order-page.component';
import { OrderFormComponent } from '../order-form/order-form.component';
import { DetailItemPageComponent } from '../../item/detail-item-page/detail-item-page.component';
import { DetailCustomerPageComponent } from '../../customer/detail-customer-page/detail-customer-page.component';
import { ReportModalComponent } from '../../report-modal/report-modal.component';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    CommonModule,
    ModelComponent,
    DetailOrderPageComponent,
    OrderFormComponent,
    DetailItemPageComponent,
    DetailCustomerPageComponent,
    ReportModalComponent,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit, OnDestroy {
  isModalFormOpen = false;
  isModalDetilOpen = false;
  isModalReport = false;
  orders: any[] = [];
  order!: any;
  editedOrder: any = {};
  currentPage = 1; // Current page
  pageSize = 10; // Items per page

  private readonly destroy$ = new Subject<void>();
  private readonly refreshData$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private apollo: Apollo
  ) {}

  ngOnInit(): void {
    this.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getAllOrders());
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

  trackByOrderId(index: number, customer: any): number {
    return customer.customerId; // Return unique ID for each item
  }

  getAllOrders(): void {
    this.orderService.getAllOrder(this.currentPage, this.pageSize).subscribe({
      next: (response: GetAllData) => {
        if (response.header) {
          this.orders = response.data;
          this.cdr.detectChanges(); // Trigger change detection after data update
        }
      },
      error: (error: any) => {
        console.error('Error fetching items', error);
        this.toastr.error('Error fetching items');
      },
    });
  }

  openModalForm(): void {
    this.isModalFormOpen = true;
    this.cdr.detectChanges(); // Trigger change detection after opening modal
  }

  openModalReport(): void {
    this.isModalReport = true;
    this.cdr.detectChanges(); // Trigger change detection after opening modal
  }

  closeModal(): void {
    this.isModalFormOpen = false;
    this.refreshData$.next();
    this.isModalDetilOpen = false;
    this.isModalReport = false;
    this.cdr.detectChanges(); // Trigger change detection after closing modal
  }

  loadItem(order: any): void {
    this.order = order;
    this.openModalForm();
  }

  openModalDetil(orderId: string): void {
    this.apollo
      .query<{ getOrder: any }>({
        query: gql`
          query GetOrder{
            getOrder(orderId: "${orderId}") {
              header {
                code
                status
                message
              }
              data {
                orderId
                orderCode
                orderDate
                totalPrice
                quantity
                customers {
                  customerName
                }
                items {
                  itemName
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderId,
        },
      })
      .subscribe({
        next: (response) => {
          const getItemResponse = response.data.getOrder;
          if (getItemResponse.header.code === '200') {
            this.order = getItemResponse.data;
            this.isModalDetilOpen = true;
            this.isModalFormOpen = false;
            this.cdr.detectChanges(); // Trigger change detection after opening modal
            console.log('Order:', this.order);
          } else {
            this.toastr.error(
              'Failed to load order details: ' + getItemResponse.header.message
            );
          }
        },
        error: (error) => {
          console.error('Error fetching order details:', error);
          this.toastr.error('Error fetching order details');
        },
      });
  }

  deleteOrder(id: string): void {
    this.apollo
      .mutate<{ deleteOrder: HeaderResponse }>({
        mutation: gql`
          mutation DeleteOrder {
            deleteOrder(id: "${id}") {
              code
              status
              message
            }
          }
        `,
      })
      .subscribe({
        next: (response) => {
          if (
            response &&
            response.data &&
            response.data.deleteOrder.code === '200'
          ) {
            this.toastr.success('Item deleted successfully');
            this.refreshData$.next(); // Refresh data after successful delete
            window.location.reload();
          } else {
            this.toastr.error('Failed to delete item: ');
          }
        },
        error: (error) => {
          console.error('Error deleting order', error);
          this.toastr.error('Failed to delete order. Please try again later.');
        },
      });
  }
}

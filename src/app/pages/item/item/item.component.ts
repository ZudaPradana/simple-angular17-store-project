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
import { DetailItemPageComponent } from '../detail-item-page/detail-item-page.component';
import { ItemFormComponent } from '../item-form/item-form.component';
import { DetailOrderPageComponent } from '../../order/detail-order-page/detail-order-page.component';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    CommonModule,
    ModelComponent,
    DetailItemPageComponent,
    ItemFormComponent,
    DetailOrderPageComponent,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
})
export class ItemComponent implements OnInit, OnDestroy {
  isModalFormOpen = false;
  isModalDetilOpen = false;
  items: any[] = [];
  item!: any;
  editedItem: any = {};
  currentPage = 1; // Current page
  pageSize = 10; // Items per page

  private readonly destroy$ = new Subject<void>();
  private readonly refreshData$ = new Subject<void>();

  constructor(
    private itemService: ItemService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private apollo: Apollo
  ) {}

  ngOnInit(): void {
    this.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getAllItems());
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

  trackByItemId(index: number, customer: any): number {
    return customer.customerId; // Return unique ID for each item
  }

  getAllItems(): void {
    this.itemService.getAllItem(this.currentPage, this.pageSize).subscribe({
      next: (response: GetAllData) => {
        if (response.header) {
          this.items = response.data;
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

  closeModal(): void {
    this.isModalFormOpen = false;
    this.refreshData$.next();
    this.isModalDetilOpen = false;
    this.cdr.detectChanges(); // Trigger change detection after closing modal
  }

  loadItem(item: any): void {
    this.item = item;
    this.openModalForm();
  }

  openModalDetil(itemId: string): void {
    this.apollo
      .query<{ getItem: GetData }>({
        query: gql`
          query GetItem {
            getItem(itemId: "${itemId}") {
              header {
                code
                status
                message
              }
              data {
                itemName
                itemDescription
                price
                stock
                isAvailable
                lastRestock
              }
            }
          }
        `,
        variables: {
          itemId: itemId,
        },
      })
      .subscribe({
        next: (response) => {
          const getItemResponse = response.data.getItem;
          if (getItemResponse.header.code === '200') {
            this.item = getItemResponse.data;
            this.isModalDetilOpen = true;
            this.isModalFormOpen = false;
            this.cdr.detectChanges(); // Trigger change detection after opening modal
            console.log('Item:', this.item);
          } else {
            this.toastr.error(
              'Failed to load item details: ' + getItemResponse.header.message
            );
          }
        },
        error: (error) => {
          console.error('Error fetching item details:', error);
          this.toastr.error('Error fetching item details');
        },
      });
  }

  deleteItem(id: string): void {
    this.apollo
      .mutate<{ deleteItem: HeaderResponse }>({
        mutation: gql`
          mutation DeleteItem {
            deleteItem(id: "${id}") {
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
            response.data.deleteItem.code === '200'
          ) {
            this.toastr.success('Item deleted successfully');
            this.refreshData$.next(); // Refresh data after successful delete
            window.location.reload();
          } else {
            this.toastr.error('Failed to delete item: ');
          }
        },
        error: (error) => {
          console.error('Error deleting item', error);
          this.toastr.error('Failed to delete item. Please try again later.');
        },
      });
  }
}

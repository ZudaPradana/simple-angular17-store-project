import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { EmployeeService } from '../../../services/employee/employee.service';
import { map } from 'rxjs';
import { ItemService } from '../../../services/item/item.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
})
export class OrderFormComponent implements OnChanges {
  @Input() data: any = null;
  @Output() onCloseModel = new EventEmitter();

  orderForm!: FormGroup;
  customers: any[] = [];
  items: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService,
    private customerService: EmployeeService,
    private itemService: ItemService
  ) {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      itemId: ['', Validators.required],
      quantity: ['', Validators.required],
    });
  }

  CREATE_ORDER_MUTATION = gql`
    mutation CreateOrder($createOrder: RequestOrderCreate!) {
      createOrder(createOrder: $createOrder) {
        code
        status
        message
      }
    }
  `;

  UPDATE_ORDER_MUTATION = gql`
    mutation UpdateOrder($id: ID!, $updateOrder: RequestOrderUpdate!) {
      updateOrder(id: $id, updateOrder: $updateOrder) {
        code
        status
        message
      }
    }
  `;

  ngOnInit(): void {
    this.loadCustomers();
    this.loadItems();
  }

  loadCustomers() {
    this.customerService
      .getAllCustomers(1, 100)
      .pipe(
        map((response) => {
          if (response.header.status) {
            this.customers = response.data; // Memuat data pelanggan ke dalam array customers
          } else {
            // Handle error or empty response
            this.customers = []; // Memastikan customers tetap array kosong jika ada error atau response kosong
          }
        })
      )
      .subscribe(); // Menjalankan langganan untuk mendapatkan data pelanggan
  }

  loadItems() {
    this.itemService
      .getAllItem(1, 100)
      .pipe(
        map((response) => {
          if (response.header.status) {
            this.items = response.data; // Memuat data item ke dalam array items
          } else {
            // Handle error or empty response
            this.items = []; // Memastikan items tetap array kosong jika ada error atau response kosong
          }
        })
      )
      .subscribe(); // Menjalankan langganan untuk mendapatkan data item
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      console.log('Data changed:', changes['data'].currentValue);
      this.setFormData(changes['data'].currentValue);
    }
  }

  setFormData(data: any) {
    console.log('Setting form data:', data);

    this.orderForm.setValue({
      customerId: data.customers.customerId || '',
      itemId: data.items.itemId || '',
      quantity: data.quantity || '',
    });
  }

  onClose() {
    this.resetOrderForm();
    window.location.reload();
    this.onCloseModel.emit(false);
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const orderData = this.orderForm.value;
      console.log('Order data:', orderData);
      // console.log('ID ORDER:', this.data.orderId);
      if (this.data && this.data.orderId) {
        // Jika data ada dan itemId tidak null, maka ini adalah operasi update
        this.apollo
          .mutate({
            mutation: this.UPDATE_ORDER_MUTATION,
            variables: {
              id: this.data.orderId,
              updateOrder: {
                itemId: parseInt(orderData.itemId),
                quantity: orderData.quantity,
              },
            },
          })
          .subscribe({
            next: (response: any) => {
              console.log('Update Order Response:', response);
              this.toastr.success(response.data.updateOrder.message);
              setTimeout(() => {
                this.resetOrderForm(); // Reset form setelah berhasil update
                this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
                window.location.reload(); // Refresh browser setelah 3 detik
              }, 1000);
            },
            error: (error) => {
              console.error('Error updating order:', error.message);
              this.toastr.error('Failed to update order: ' + error.message);
            },
          });
      } else {
        // Jika data tidak ada atau itemId null, maka ini adalah operasi create
        this.apollo
          .mutate({
            mutation: this.CREATE_ORDER_MUTATION,
            variables: {
              createOrder: {
                customerId: orderData.customerId,
                itemId: orderData.itemId,
                quantity: orderData.quantity,
              },
            },
          })
          .subscribe({
            next: (response: any) => {
              console.log('Create Order Response:', response);
              this.toastr.success(response.data.createOrder.message);
              setTimeout(() => {
                this.resetOrderForm(); // Reset form setelah berhasil update
                this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
                window.location.reload(); // Refresh browser setelah 3 detik
              }, 1000);
            },
            error: (error) => {
              console.error('Error creating order:', error);
              this.toastr.error('Failed to create order: ' + error.message);
            },
          });
      }
    } else {
      this.orderForm.markAllAsTouched();
    }
  }

  resetOrderForm() {
    this.orderForm.reset();
    this.data = null; // Clear the data input to ensure form is reset properly
  }
}

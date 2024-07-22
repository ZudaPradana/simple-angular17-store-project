import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
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
import { ItemService } from '../../../services/item/item.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent implements OnChanges {
  @Input() data: any = null;
  @Output() onCloseModel = new EventEmitter();

  itemForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) {
    this.itemForm = this.fb.group({
      itemName: ['', Validators.required],
      itemDescription: [''],
      price: ['', Validators.required],
      stock: ['', Validators.required],
    });
  }

  CREATE_ITEM_MUTATION = gql`
    mutation CreateItem($createItem: RequestItemCreateUpdate!) {
      createItem(createItem: $createItem) {
        code
        status
        message
      }
    }
  `;

  UPDATE_ITEM_MUTATION = gql`
    mutation UpdateItem($id: ID!, $updateItem: RequestItemCreateUpdate!) {
      updateItem(id: $id, updateItem: $updateItem) {
        code
        status
        message
      }
    }
  `;
  onClose() {
    this.resetItemForm();
    this.onCloseModel.emit(false);
  }

  ngOnChanges(): void {
    if (this.data) {
      this.itemForm.patchValue({
        itemName: this.data.itemName,
        itemDescription: this.data.itemDescription,
        price: this.data.price,
        stock: this.data.stock,
      });
    }
  }

  onSubmit() {
    if (this.itemForm.valid) {
      const itemData = this.itemForm.value;
      console.log('Submitting item data:', itemData);
      console.log('Form valid:', this.itemForm.valid);
      console.log('Data available:', this.data);
      console.log('Data ID:', this.data ? this.data.itemId : 'No ID');

      if (this.data && this.data.itemId != null) {
        // Update Item
        this.apollo
          .mutate({
            mutation: this.UPDATE_ITEM_MUTATION,
            variables: {
              id: this.data.itemId,
              updateItem: itemData,
            },
          })
          .subscribe({
            next: (response: any) => {
              console.log('Update Item Response:', response);
              this.toastr.success(response.data.updateItem.message);
              // Update the form with the latest data if necessary
              this.itemForm.patchValue({
                itemName: itemData.itemName,
                itemDescription: itemData.itemDescription,
                price: itemData.price,
                stock: itemData.stock,
              });
              setTimeout(() => {
                this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
                window.location.reload(); // Refresh browser setelah 3 detik
              }, 1000);
            },
            error: (error) => {
              console.error('Error updating item:', error.message);
              this.toastr.error('Failed to update item: ' + error.message);
            },
          });
      } else {
        // Create Item
        console.log('Creating new item');
        this.apollo
          .mutate({
            mutation: this.CREATE_ITEM_MUTATION,
            variables: {
              createItem: itemData,
            },
          })
          .subscribe({
            next: (response: any) => {
              console.log('Create Item Response:', response);
              this.toastr.success(response.data.createItem.message);
              setTimeout(() => {
                this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
                window.location.reload(); // Refresh browser setelah 3 detik
              }, 1000);
            },
            error: (error) => {
              console.error('Error creating item:', error);
              this.toastr.error('Failed to create item: ' + error.message);
            },
          });
      }
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  resetItemForm() {
    this.itemForm.reset();
    this.data = null; // Clear the data input to ensure form is reset properly
  }
}

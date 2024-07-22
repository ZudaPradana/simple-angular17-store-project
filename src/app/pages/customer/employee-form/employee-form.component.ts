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
import { EmployeeService } from '../../../services/employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import {
  InputCreateSchema,
  HeaderResponse,
} from '../../shared/models/Employee';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnChanges {
  @Input() data: any = null;
  @Output() onCloseModel = new EventEmitter();

  employeeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) {
    this.employeeForm = this.fb.group({
      customerName: ['', Validators.required],
      customerAddress: [''],
      customerPhone: [''],
      pic: [null],
      isActive: [true, Validators.required],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.employeeForm.patchValue({
          pic: reader.result, // Set the Base64 string to the pic control
        });
      };
    }
  }

  onClose() {
    this.resetEmployeeForm();
    this.onCloseModel.emit(false);
  }

  ngOnChanges(): void {
    if (this.data) {
      this.employeeForm.patchValue({
        customerName: this.data.customerName,
        customerAddress: this.data.customerAddress,
        customerPhone: this.data.customerPhone,
        pic: this.data.pic,
        isActive: this.data.isActive,
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const customerData: InputCreateSchema = this.employeeForm.value;
      console.log('Submitting customer data:', customerData);
      console.log('Form valid:', this.employeeForm.valid);

      if (this.data && this.data.id) {
        this.employeeService
          .updateCustomer(this.data.id, customerData)
          .subscribe({
            next: (response: HeaderResponse) => {
              this.toastr.success(response.message);
              setTimeout(() => {
                this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
                window.location.reload(); // Refresh browser setelah 3 detik
              }, 1000);
            },
            error: (error) => {
              console.error('Error updating customer:', error);
              this.toastr.error('Failed to update customer: ' + error.message);
            },
          });
      } else {
        this.employeeService.createCustomer(customerData).subscribe({
          next: (response: HeaderResponse) => {
            console.log('Create Customer Response:', response);
            this.toastr.success(response.message);
            setTimeout(() => {
              this.onCloseModel.emit(false); // Emit event close model setelah berhasil update
              window.location.reload(); // Refresh browser setelah 3 detik
            }, 1000);
          },
          error: (error) => {
            console.error('Error creating customer:', error);
            this.toastr.error('Failed to create customer: ' + error.message);
          },
        });
      }
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }

  resetEmployeeForm() {
    this.employeeForm.reset();
    this.data = null; // Clear the data input to ensure form is reset properly
  }
}

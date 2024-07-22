import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { EmployeeService } from '../../services/employee/employee.service';
import { ItemService } from '../../services/item/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class ReportModalComponent {
  @Input() customers: any[] = [];
  @Input() items: any[] = [];
  @Output() onCloseModel = new EventEmitter();

  reportForm!: FormGroup;

  ngOnInit(): void {
    this.loadCustomers();
    this.loadItems();
  }

  constructor(
    private fb: FormBuilder,
    private customerService: EmployeeService,
    private itemService: ItemService,
    private http: HttpClient
  ) {
    this.createForm();
  }

  createForm() {
    this.reportForm = this.fb.group({
      customerId: [''],
      itemId: [''],
    });
  }

  onSubmit() {
    if (this.reportForm.valid) {
      const { customerId, itemId } = this.reportForm.value;
      const apiUrl = `http://localhost:8080/v1/report-download?name=${customerId}&item=${itemId}`;

      this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `order_report_${new Date().toISOString()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.onCloseModel.emit();
      });
    }
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

  onClose() {
    window.location.reload();
    this.onCloseModel.emit(false);
  }
}

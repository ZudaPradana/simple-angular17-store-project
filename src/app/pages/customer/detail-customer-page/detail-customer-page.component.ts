import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-detail-customer-page',
  standalone: true,
  templateUrl: './detail-customer-page.component.html',
  styleUrls: ['./detail-customer-page.component.scss'],
})
export class DetailCustomerPageComponent {
  @Input() customer: any;
  @Output() onCloseModel = new EventEmitter();
  loading: boolean = true;

  // Method to close the modal
  onClose() {
    this.onCloseModel.emit(false);
  }

  ngOnChanges() {
    if (this.customer) {
      this.loading = false;
    }
  }
}

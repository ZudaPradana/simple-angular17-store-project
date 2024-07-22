import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-detail-order-page',
  standalone: true,
  imports: [],
  templateUrl: './detail-order-page.component.html',
  styleUrl: './detail-order-page.component.scss',
})
export class DetailOrderPageComponent {
  @Input() order: any;
  @Output() onCloseModel = new EventEmitter();
  loading: boolean = true;

  // Method to close the modal
  onClose() {
    this.onCloseModel.emit(false);
  }

  ngOnChanges() {
    if (this.order) {
      this.loading = false;
    }
  }
}

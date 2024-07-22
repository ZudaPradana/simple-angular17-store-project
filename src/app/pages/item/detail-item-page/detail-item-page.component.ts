import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-detail-item-page',
  standalone: true,
  imports: [],
  templateUrl: './detail-item-page.component.html',
  styleUrl: './detail-item-page.component.scss',
})
export class DetailItemPageComponent {
  @Input() item: any;
  @Output() onCloseModel = new EventEmitter();
  loading: boolean = true;

  // Method to close the modal
  onClose() {
    this.onCloseModel.emit(false);
  }

  ngOnChanges() {
    if (this.item) {
      this.loading = false;
    }
  }
}

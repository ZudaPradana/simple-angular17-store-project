import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet],
})
export class AppComponent {
  title = 'simple-crud-fruit-commerce';
  constructor(private router: Router) {}
  navigateToCustomers() {
    this.router.navigate(['/customers']);
  }

  navigateToItems() {
    this.router.navigate(['/items']);
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }
}

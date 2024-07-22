import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCustomerPageComponent } from './detail-customer-page.component';

describe('DetailCustomerPageComponent', () => {
  let component: DetailCustomerPageComponent;
  let fixture: ComponentFixture<DetailCustomerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCustomerPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailCustomerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

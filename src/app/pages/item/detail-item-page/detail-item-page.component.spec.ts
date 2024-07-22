import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailItemPageComponent } from './detail-item-page.component';

describe('DetailItemPageComponent', () => {
  let component: DetailItemPageComponent;
  let fixture: ComponentFixture<DetailItemPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailItemPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailItemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

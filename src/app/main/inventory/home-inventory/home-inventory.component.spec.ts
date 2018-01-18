import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeInventoryComponent } from './home-inventory.component';

describe('HomeInventoryComponent', () => {
  let component: HomeInventoryComponent;
  let fixture: ComponentFixture<HomeInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

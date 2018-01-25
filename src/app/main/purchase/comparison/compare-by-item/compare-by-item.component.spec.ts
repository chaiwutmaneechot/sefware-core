import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareByItemComponent } from './compare-by-item.component';

describe('CompareByItemComponent', () => {
  let component: CompareByItemComponent;
  let fixture: ComponentFixture<CompareByItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompareByItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareByItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

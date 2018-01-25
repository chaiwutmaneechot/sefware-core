import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnInit {

  loading: boolean = true;
  menu_expand: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }
}

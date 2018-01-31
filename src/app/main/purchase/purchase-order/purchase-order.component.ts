import { Component, OnInit } from '@angular/core';
import { Language } from 'angular-l10n';

@Component({
  selector: 'app-purchase-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnInit {

  @Language() lang: string;

  loading: boolean = true;
  menu_expand: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

  updateFilter() {}

  openLogs() {}
}

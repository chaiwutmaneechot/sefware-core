import { Component, OnInit } from '@angular/core';
import { Language } from 'angular-l10n';

@Component({
  selector: 'app-purchase-purchase-requisition',
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {

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

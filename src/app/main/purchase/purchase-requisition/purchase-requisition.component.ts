import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase-purchase-requisition',
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {

  loading: boolean = true;
  menu_expand: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

}

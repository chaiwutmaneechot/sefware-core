import { Component, OnInit } from '@angular/core';
import { Language } from 'angular-l10n';

@Component({
  selector: 'app-purchase-goods-receive',
  templateUrl: './goods-receive.component.html',
  styleUrls: ['./goods-receive.component.scss']
})
export class GoodsReceiveComponent implements OnInit {

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

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase-goods-receive',
  templateUrl: './goods-receive.component.html',
  styleUrls: ['./goods-receive.component.scss']
})
export class GoodsReceiveComponent implements OnInit {

  loading: boolean = true;
  menu_expand: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }
}

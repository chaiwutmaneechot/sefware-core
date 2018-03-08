import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import {TdLoadingService} from '@covalent/core';
import * as _ from 'lodash';
import { Supplier } from '../../../../setup/supplier/supplier';
import { ItemService } from '../../../../setup/item/item.service';
import { Page } from '../../../../shared/model/page';
import { ItemGroupService } from '../../../../setup/item-group/item-group.service';
import { UomService } from '../../../../setup/uom/uom.service';
import { Uom } from '../../../../setup/uom/uom';
import { ItemTypeService } from '../../../../setup/item-type/item-type.service';
import { ItemGroup } from '../../../../setup/item-group/item-group';
import { ItemType } from '../../../../setup/item-type/item-type';
import { ItemSubGroupService } from '../../../../setup/item-sub-group/item-sub-group.service';
import { ItemSubGroup } from '../../../../setup/item-sub-group/item-sub-group';
import { PurchaseOrderService } from '../../purchase-order/purchase-order.service';
import { PurchaseOrder, PurchaseOrderItem } from '../../purchase-order/purchase-order';
import { PurchaseRequisitionItem } from '../../purchase-requisition/purchase-requisition';
import { ItemWithComparisonService } from '../../comparison/item-with-comparison.service';
import { SupplierService } from '../../../../setup/supplier/supplier.service';

@Component({
  selector: 'app-purchase-order-dialog',
  templateUrl: './purchase-order-dialog.component.html',
  styleUrls: ['./purchase-order-dialog.component.scss'],
  providers: [PurchaseOrderService, ItemWithComparisonService, ItemService, ItemTypeService, ItemGroupService, ItemSubGroupService, SupplierService, UomService]
})
export class PurchaseOrderDialogComponent implements OnInit {

  data: PurchaseOrder = new PurchaseOrder({});
  loading: boolean = true;
  error: any;
  title: string = 'Purchase Order';

  images = [];
  rows: any[] = [];
  temp = [];
  page = new Page();
  cache: any = {};
  expanded: any = {};
  toDay = new Date();
  suppliers = [];
  types = [];
  groups = [];
  subgroups = [];
  uoms = [];

  vat_types = [
    {code: 'none_vat', name: 'None VAT'},
    {code: 'vat_inclusive', name: 'VAT Inclusive'},
    {code: 'vat_exclusive', name: 'VAT Exclusive'}
  ];

  storage_ref = '/main/settings/department';

  constructor(@Inject(MAT_DIALOG_DATA) public md_data: PurchaseOrder,
              private _purchaseOrderService: PurchaseOrderService,
              private _itemWithComparisonService: ItemWithComparisonService,
              private _itemService: ItemService,
              private _itemtypeService: ItemTypeService,
              private _itemgroupService: ItemGroupService,
              private _itemsubgroupService: ItemSubGroupService,
              private _supplierService: SupplierService,
              private _uomService: UomService,
              private _loadingService: TdLoadingService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<PurchaseOrderDialogComponent>) {
    try {
      if (md_data) {
        this.title = 'Edit ' + this.title;
        this.data = new PurchaseOrder(md_data);
        this.getItemGroupData(this.data.type);
        this.getItemSubGroupData(this.data.group);
      } else {
        this.title = 'New ' + this.title;
        this._purchaseOrderService.requestData().subscribe(() => {
          this.generateCode();
        });
      }
    } catch (error) {
      this.error = error;
    }

    this.page.size = 50;
    this.page.pageNumber = 0;
  }

  ngOnInit(): void {
    this.getItemTypeData();
    this.getSupplierData();
    this.getUnitData();
  }

  setPage(pageInfo) {

    if (pageInfo) {
      this.page.pageNumber = pageInfo.pageIndex;
      this.page.size = pageInfo.pageSize;
    }

    this._purchaseOrderService.getResults(this.page).subscribe((pagedData) => {
      this.page = pagedData.page;
      this.rows = pagedData.data;
    });

  }

  updateFilter(event) {
    if (event === '') {
      this.setPage(null);
      return;
    }

    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function(d) {
      return (d.code.toLowerCase().indexOf(val) !== -1) ||
        (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
        (d.unit && d.unit.toLowerCase().indexOf(val) !== -1) ||
        (d.price && d.price.toLowerCase().indexOf(val) !== -1)
        || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    // this.table.offset = 0;
  }

  generateCode() {
    this._loadingService.register('data.form');
    const _year = '-' + this.toDay.getFullYear();
    let _month = '-' + (this.toDay.getMonth() + 1);
    if (this.toDay.getMonth() < 10) {
      _month = '-0' + (this.toDay.getMonth() + 1);
    }

    const prefix = 'PO' + _year + _month;

    this.data.code = prefix + '-001';
    this._purchaseOrderService.requestLastData(prefix).subscribe((s) => {
      s.forEach((ss: PurchaseOrder) => {
        console.log('Prev Code :' + ss.code);
        // tslint:disable-next-line:radix
        const str = parseInt(ss.code.substring(ss.code.length - 3, ss.code.length)) + 1;
        let last = '' + str;

        if (str < 100) {
          last = '0' + str;
        }

        if (str < 10) {
          last = '00' + str;
        }

        this.data.code = prefix + '-' + last;
      });
      this._loadingService.resolve('data.form');
    });
  }

  saveData(form) {

    // if (form.valid) {

    this.error = false;
    this._loadingService.register();

    // this.data.code = form.value.code ? form.value.code : null;

    if (this.md_data) {
      if (_.isEqual(this.data, this.md_data)) {
        this.dialogRef.close(false);
        this._loadingService.resolve();
      } else {
        this._purchaseOrderService.updateData(this.data).then(() => {
          this.dialogRef.close(this.data);
          this._loadingService.resolve();
        }).catch((err) => {
          this.error = err.message;
          this._loadingService.resolve();
        });
      }
    } else {
      this._purchaseOrderService.addData(this.data).then(() => {
        this.dialogRef.close(this.data);
        this._loadingService.resolve();
      }).catch((err) => {
        this.error = err.message;
        this._loadingService.resolve();
      });
    }
    // }
  }

  deleteItemData(row) {
    this.data.item = this.data.item.filter((item) => item !== row);
    this.sumaryTotal();
  }

  getItemTypeData() {
    this._itemtypeService.requestData().subscribe((snapshot) => {
      this._itemtypeService.rows = [];
      snapshot.forEach((s) => {

        const _row = new ItemType(s.val());
        this.types.push(_row);
      });
    });
  }

  getItemGroupData(typeCode) {
    this.groups = [];
    this.subgroups = [];
    this._itemgroupService.requestDataByType(typeCode).subscribe((snapshot) => {
      this._itemgroupService.rows = [];
      snapshot.forEach((s) => {

        const _row = new ItemGroup(s);
        this.groups.push(_row);
      });
    });
  }

  getItemSubGroupData(groupCode) {
    this.subgroups = [];
    this._itemsubgroupService.requestDataByGroup(groupCode).subscribe((snapshot) => {
      this._itemsubgroupService.rows = [];
      snapshot.forEach((s) => {

        const _row = new ItemSubGroup(s);
        this.subgroups.push(_row);
      });
    });
  }

  getSupplierData() {
    this._supplierService.requestData().subscribe((snapshot) => {
      this._supplierService.rows = [];
      snapshot.forEach((s) => {

        const _row = new Supplier(s.val());
        this.suppliers.push(_row);
      });
    });
  }

  getUnitData() {
    this._uomService.requestData().subscribe((snapshot) => {
      this._uomService.rows = [];
      snapshot.forEach((s) => {

        const _row = new Uom(s.val());
        this.uoms.push(_row);
      });
    });
  }

  loadItemData(data) {
    this.error = false;
    this._loadingService.register();
    let item_code = '';
    this.data.item = [];
    if (data.type !== null) {
      if ((data.group !== null) && (data.group.startsWith(data.type))) {
        if ((data.subgroup !== null) && (data.subgroup.startsWith(data.group))) {
          item_code = data.subgroup;
        } else {
          item_code = data.group;
          data.subgroup = '';
        }
      } else {
        item_code = data.type;
        data.group = '';
        data.subgroup = '';
      }
    }

    this._itemWithComparisonService.requestItemData(item_code).subscribe((snapshot) => {
      this._itemWithComparisonService.rows = [];
      snapshot.forEach((s) => {
        const _row = new PurchaseOrderItem(s);
        this.uoms.forEach((uom) => {
          if (_row.primary_unit === uom.code) {
            _row.primary_unit_name = uom.name1;
          }
          if (_row.secondary_unit === uom.code) {
            _row.secondary_unit_name = uom.name1;
          }
        });
        this.data.item.push(_row);
      });
    });
    this.sumaryTotal();
    this._loadingService.resolve();
  }

  calAmount(row) {
    row.amount = (row.quantity * row.price) - row.discount;
    this.sumaryTotal();
  }

  sumaryTotal() {
    this.data.discount_total = 0;
    this.data.grand_total = 0;
    this.data.sub_total = 0;
    this.data.net_total = 0;
    this.data.vat_total = 0;
    this.data.item.forEach((sum) => {
      this.data.discount_total += sum.discount;
      this.data.net_total += sum.amount;
      this.data.sub_total = this.data.net_total + this.data.discount_total;
    });
    switch (this.data.vat_type) {
      case 'none_vat':
        this.data.vat_total = (this.data.net_total * 0) / 100;
        this.data.grand_total = this.data.net_total + this.data.vat_total;
        break;
      case 'vat_inclusive':
        this.data.vat_total = (this.data.net_total * 7) / 107;
        this.data.grand_total = this.data.net_total - this.data.vat_total;
        break;
      case 'vat_exclusive':
        this.data.vat_total = (this.data.net_total * 7) / 100;
        this.data.grand_total = this.data.net_total + this.data.vat_total;
        break;
      default:
        this.data.vat_total = 0;
        this.data.grand_total = this.data.net_total + this.data.vat_total;
        break;
    }
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}

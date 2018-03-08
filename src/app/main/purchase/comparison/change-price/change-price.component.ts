import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import {Language} from 'angular-l10n';
import {TdLoadingService} from '@covalent/core';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { Page } from '../../../../shared/model/page';

import { ItemWithCompare } from '../item-with-compare';
import { Supplier } from '../../../../setup/supplier/supplier';
import { Uom } from '../../../../setup/uom/uom';

import { ItemWithComparisonService } from '../item-with-comparison.service';
import { SupplierService } from '../../../../setup/supplier/supplier.service';
import { UomService } from '../../../../setup/uom/uom.service';

@Component({
  selector: 'app-change-price',
  templateUrl: './change-price.component.html',
  styleUrls: ['./change-price.component.scss'],
  providers: [ItemWithComparisonService, SupplierService, UomService]

})
export class ChangePriceComponent implements OnInit {
  data: ItemWithCompare = new ItemWithCompare({});
  loading: boolean = true;
  error: any;

  images = [];
  rows: any[] = [];
  temp = [];
  page = new Page();
  cache: any = {};
  expanded: any = {};

  toDay = new Date();
  suppliers = [];
  uoms = [];

  constructor(@Inject(MAT_DIALOG_DATA) public md_data: ItemWithCompare,
              private _itemWithComparisonService: ItemWithComparisonService,
              private _supplierService: SupplierService,
              private _uomService: UomService,
              private _loadingService: TdLoadingService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<ChangePriceComponent>) {
    this.page.size = 50;
    this.page.pageNumber = 0;
  }

  ngOnInit(): void {
    this.getSupplierData();
    this.getUnitData();
    this.load();
  }

  load() {
    this.loading = true;
    this._itemWithComparisonService.requestData().subscribe((snapshot) => {
      this._itemWithComparisonService.rows = [];
      snapshot.forEach((s) => {
        const _row = new ItemWithCompare(s.val());
        this.suppliers.forEach((supplier) => {
          if (_row.supplier === supplier.code) {
            _row.supplier_name1 = supplier.name1;
            _row.supplier_name2 = supplier.name2;
          }
        });

        this.uoms.forEach((uom) => {
          if (_row.unit === uom.code) {
            _row.unit_name = uom.name1;
          }
        });
        this._itemWithComparisonService.rows.push(_row);

      });

      this.temp = [...this._itemWithComparisonService.rows];
      this.loading = false;
      this.setPage(null);
    });
  }

  setPage(pageInfo) {

    if (pageInfo) {
      this.page.pageNumber = pageInfo.pageIndex;
      this.page.size = pageInfo.pageSize;
    }

    this._itemWithComparisonService.getResults(this.page).subscribe((pagedData) => {
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

  changeValue(_row, supplier_code) {
    _row.list_supplier.forEach((_s) => {
      if (supplier_code === _s.code) {
        _row.supplier = _s.code;
        this.suppliers.forEach((supplier) => {
          if (_row.supplier === supplier.code) {
            _row.supplier_name1 = supplier.name1;
            _row.supplier_name2 = supplier.name2;
          }
        });

        _row.unit = _s.unit;
        this.uoms.forEach((uom) => {
          if (_row.unit === uom.code) {
            _row.unit_name = uom.name1;
          }
        });
        _row.price = _s.price;
      }
    });
  }

  saveData() {
    this.rows.forEach((_item) => {
      this._loadingService.register();
      this._itemWithComparisonService.updateData(_item).then(() => {
        this.dialogRef.close(this.data);
        this._loadingService.resolve();
      }).catch((err) => {
        this.error = err.message;
        this._loadingService.resolve();
      });
    });
  }
}

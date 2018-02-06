import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import {Language} from 'angular-l10n';
import {TdLoadingService} from '@covalent/core';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { Page } from '../../../../shared/model/page';

import { Comparison, ComparisonItem } from '../comparison';
import { Supplier } from '../../../../setup/supplier/supplier';
import { Item } from '../../../../setup/item/item';
import { ItemType } from '../../../../setup/item-type/item-type';
import { ItemGroup } from '../../../../setup/item-group/item-group';
import { ItemSubGroup } from '../../../../setup/item-sub-group/item-sub-group';
import { Uom } from '../../../../setup/uom/uom';

import { ComparisonService } from '../comparison.service';
import { SupplierService } from '../../../../setup/supplier/supplier.service';
import { ItemService } from '../../../../setup/item/item.service';
import { ItemTypeService } from '../../../../setup/item-type/item-type.service';
import { ItemSubGroupService } from '../../../../setup/item-sub-group/item-sub-group.service';
import { ItemGroupService } from '../../../../setup/item-group/item-group.service';
import { UomService } from '../../../../setup/uom/uom.service';
import { ConfirmComponent } from '../../../../dialog/confirm/confirm.component';
import { isBoolean } from 'util';
import { passBoolean } from 'protractor/built/util';

@Component({
  selector: 'app-compare-by-item',
  templateUrl: './compare-by-item.component.html',
  styleUrls: ['./compare-by-item.component.scss'],
  providers: [ComparisonService, SupplierService, ItemService, ItemTypeService, ItemGroupService, ItemSubGroupService, UomService]
})
export class CompareByItemComponent implements OnInit {
  data: Comparison = new Comparison({});
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
  types = [];
  groups = [];
  subgroups = [];
  uoms = [];

  storage_ref = '/main/settings/department';

  constructor(@Inject(MAT_DIALOG_DATA) public md_data: Comparison,
              private _comparisonService: ComparisonService,
              private _supplierService: SupplierService,
              private _itemService: ItemService,
              private _itemtypeService: ItemTypeService,
              private _itemgroupService: ItemGroupService,
              private _itemsubgroupService: ItemSubGroupService,
              private _uomService: UomService,
              private _loadingService: TdLoadingService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<CompareByItemComponent>) {
    try {
      if (md_data) {
        this.data = new Comparison(md_data);
        this.getItemGroupData(this.data.type);
        this.getItemSubGroupData(this.data.group);
      } else {
        this._comparisonService.requestData().subscribe(() => {
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
    this.getSupplierData();
    this.getItemTypeData();
    this.getUnitData();
  }

  setPage(pageInfo) {

    if (pageInfo) {
      this.page.pageNumber = pageInfo.pageIndex;
      this.page.size = pageInfo.pageSize;
    }

    this._comparisonService.getResults(this.page).subscribe((pagedData) => {
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

    const prefix = 'C' + _year + _month;

    this.data.code = prefix + '-001';
    this._comparisonService.requestLastData(prefix).subscribe((s) => {
      s.forEach((ss: Comparison) => {
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
          this._comparisonService.updateData(this.data).then(() => {
            this.dialogRef.close(this.data);
            this._loadingService.resolve();
          }).catch((err) => {
            this.error = err.message;
            this._loadingService.resolve();
          });
        }
      } else {
        this._comparisonService.addData(this.data).then(() => {
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
    console.log('Item Code :' + item_code);

    this._itemService.requestDataByComparison(item_code).subscribe((snapshot) => {
      this._itemService.rows = [];
      snapshot.forEach((s) => {
        console.log('Itemss Data :' + JSON.stringify(s));
        const _row = new ComparisonItem(s);
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
    this._loadingService.resolve();
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }

}

import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Language} from 'angular-l10n';
import {ConfirmComponent} from '../../../dialog/confirm/confirm.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {Page} from '../../../shared/model/page';
import {TdMediaService} from '@covalent/core';
import {LogsService} from '../../../dialog/logs-dialog/logs.service';
import {Logs} from '../../../dialog/logs-dialog/logs';
import {LogsDialogComponent} from '../../../dialog/logs-dialog/logs-dialog.component';
import {Comparison} from './comparison';
import {ComparisonService} from './comparison.service';
import {CompareByItemComponent} from './compare-by-item/compare-by-item.component';
import { Supplier } from '../../../setup/supplier/supplier';
import { SupplierService } from '../../../setup/supplier/supplier.service';
import { ItemType } from '../../../setup/item-type/item-type';
import { ItemTypeService } from '../../../setup/item-type/item-type.service';
import { Item } from '../../../setup/item/item';
import { ItemService } from '../../../setup/item/item.service';
import { ItemWithCompare } from '../comparison/item-with-compare';
import { ItemWithComparisonService } from '../comparison/item-with-comparison.service';
import { forEach } from '@angular/router/src/utils/collection';
import { ListSupplier } from './item-with-compare';
import { ChangePriceComponent } from './change-price/change-price.component';

@Component({
  selector: 'app-purchase-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  providers: [ComparisonService, SupplierService, ItemTypeService, ItemService, ItemWithComparisonService]
})
export class ComparisonComponent implements OnInit, AfterViewInit {

  @Language() lang: string;
  @ViewChild('dataTable') table: any;

  loading: boolean = true;
  menu_expand: boolean = true;

  page = new Page();
  cache: any = {};
  expanded: any = {};

  rows: any[] = [];
  temp = [];
  suppliers = [];
  types = [];
  items = [];
  item_with_compare = [];
  period_from = new Date().getTime();
  period_to = new Date().getTime();

  compare_bys = [
    {value: 'by_item', viewValue: 'By Item'},
    {value: 'by_supplier', viewValue: 'By Supplier'}
  ];

  constructor(private _comparisonService: ComparisonService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _logService: LogsService,
              private _supplierService: SupplierService,
              private _itemTypeService: ItemTypeService,
              private _itemService: ItemService,
              private _itemWithCompareService: ItemWithComparisonService,
              public media: TdMediaService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog) {

    this.page.size = 50;
    this.page.pageNumber = 0;

  }

  ngOnInit(): void {
    this.getSupplierData();
    this.getItemTypeData();
    this.getItemData();
    this.load();
  }

  ngAfterViewInit(): void {
    this.media.broadcast();
    this._changeDetectorRef.detectChanges();
  }

  load() {
    this.loading = true;
    this._comparisonService.requestData().subscribe((snapshot) => {
      this._comparisonService.rows = [];
      snapshot.forEach((s) => {

      const _row = new Comparison(s.val());
      this.suppliers.forEach((sup) => {
        if (_row.supplier === sup.code) {
          _row.supplier_name1 = sup.name1;
          _row.supplier_name2 = sup.name2;
        }
      });

      this.types.forEach((typ) => {
        if (_row.type === typ.code) {
          _row.type_name = typ.name1;
        }
      });

      this._comparisonService.rows.push(_row);

      });

      this.temp = [...this._comparisonService.rows];
      this.loading = false;
      this.setPage(null);
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

  getItemTypeData() {
    this._itemTypeService.requestData().subscribe((snapshot) => {
      this._itemTypeService.rows = [];
      snapshot.forEach((s) => {

        const _row = new ItemType(s.val());
        this.types.push(_row);
      });
    });
  }

  getItemData() {
    this._itemService.requestData().subscribe((snapshot) => {
      this._itemService.rows = [];
      snapshot.forEach((s) => {

        const _row = new Item(s.val());
        this.item_with_compare.push(_row);
      });
    });
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

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

  searchPeriod() {
    const _period_from = new Date(this.period_from);
    const _period_to = new Date(this.period_to);

    // set time to 00:00:00
    _period_from.setHours(0);
    _period_from.setMinutes(0);
    _period_from.setSeconds(0);

    // set time to 23:59:59
    _period_to.setHours(23);
    _period_to.setMinutes(59);
    _period_to.setSeconds(59);

    // filter our data
    const temp = this.temp.filter(function(d) {
      return (d.period_from >= _period_from.getTime()) &&
        (d.period_to <= _period_to.getTime());
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    // this.table.offset = 0;
    console.log('from :' + _period_from + ' To :' + _period_to);
  }

  addData() {
    const dialogRef = this.dialog.open(CompareByItemComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Create', 'Create comparison by item succeed', result, {});
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  editData(data: Comparison) {
    const dialogRef = this.dialog.open(CompareByItemComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Update', 'Update comparison succeed', result, data);
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  deleteData(data: Comparison) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'delete',
        title: 'Delete comparison',
        content: 'Confirm to delete?',
        data_title: 'Comparison',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._comparisonService.removeData(data).then(() => {
          this.snackBar.open('Delete comparison succeed', '', {duration: 3000});
          this.addLog('Delete', 'Delete comparison succeed', data, {});

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  enableData(data: Comparison) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'enable',
        title: 'Enable comparison',
        content: 'Comparison with enabled will be able to use',
        data_title: 'Comparison',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._comparisonService.updateDataStatus(data, false).then(() => {
          this.snackBar.open('Enable comparison succeed', '', {duration: 3000});

          const new_data = new Comparison(data);
          new_data.disable = false;
          this.addLog('Enable', 'Enable comparison succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });

  }

  disableData(data: Comparison) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'disable',
        title: 'Disable comparison',
        content: 'Comparison with disabled are not able to use',
        data_title: 'Comparison',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._comparisonService.updateDataStatus(data, true).then(() => {
          this.snackBar.open('Disable comparison succeed', '', {duration: 3000});

          const new_data = new Comparison(data);
          new_data.disable = false;
          this.addLog('Disable', 'Disable comparison succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  processData() {
    // console.log('IWC0 add:' + JSON.stringify(this.item_with_compare));
    this.rows.forEach((temp_list) => {
      // console.log('Data : ' + JSON.stringify(temp_list));
      temp_list.item.forEach((tmp2) => {
        // console.log('tmp2 : ' + JSON.stringify(tmp2));
        // console.log('temp_list Code : ' + temp_list.code);
        if (!tmp2.unit) {
          tmp2.unit = '';
        }

        const list_supplier = {
          code: temp_list.supplier,
          name1: temp_list.supplier_name1,
          name2: temp_list.supplier_name2,
          price: tmp2.price,
          unit: tmp2.unit
        };
        // console.log('list_supplier : ' + JSON.stringify(list_supplier));
        this.item_with_compare.forEach((itwc) => {
          // console.log('itwc : ' + JSON.stringify(itwc));
          if (itwc.code === tmp2.code) {
            if (itwc.list_supplier) {
              itwc.list_supplier = itwc.list_supplier.filter((_supplier) => _supplier.code !== list_supplier.code);
              itwc.list_supplier.push(list_supplier);
            } else {
              itwc.list_supplier = [];
              itwc.list_supplier.push(list_supplier);
            }

            if (!itwc.price || itwc.price > tmp2.price) {
              itwc.supplier = temp_list.supplier;
              itwc.price = tmp2.price;
              itwc.unit = tmp2.unit;
              // console.log('IWC up:' + JSON.stringify(this.item_with_compare));
            }

            this._itemWithCompareService.updateData(itwc);
          }
        });
      });
    });
    this.snackBar.open('Process comparison complete', '', {duration: 3000});
  }

  changePrice() {
    const dialogRef = this.dialog.open(ChangePriceComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Create', 'Create comparison by item succeed', result, {});
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  openLogs(data: Comparison) {
    this.dialog.open(LogsDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data: {
        menu: 'Comparison',
        path: this._comparisonService.getPath(),
        ref: data ? data.code : null
      },
    });
  }

  addLog(operation: string, description: string, data: any, old: any): void {
    const log = new Logs({});
    log.path = this._comparisonService.getPath();
    log.ref = data.code;
    log.operation = operation;
    log.description = description;
    log.old_data = old;
    log.new_data = data;
    this._logService.addLog(this._comparisonService.getPath(), log);
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
        (d.supplier && d.supplier.toLowerCase().indexOf(val) !== -1) ||
        (d.supplier_name1 && d.supplier_name1.toLowerCase().indexOf(val) !== -1) ||
        (d.supplier_name2 && d.supplier_name2.toLowerCase().indexOf(val) !== -1) ||
        (d.type_name && d.type_name.toLowerCase().indexOf(val) !== -1)
        || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}

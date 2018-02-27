import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TdMediaService } from '@covalent/core';
import { Language } from 'angular-l10n';
import { Page } from '../../../shared/model/page';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmComponent } from '../../../dialog/confirm/confirm.component';
import { Logs } from '../../../dialog/logs-dialog/logs';
import { LogsService } from '../../../dialog/logs-dialog/logs.service';
import { LogsDialogComponent } from '../../../dialog/logs-dialog/logs-dialog.component';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { PurchaseOrder } from '../purchase-order/purchase-order';
import { PurchaseOrderDialogComponent } from './purchase-order-dialog/purchase-order-dialog.component';
import { Comparison } from '../comparison/comparison';
import { SupplierService } from '../../../setup/supplier/supplier.service';
import { Supplier } from '../../../setup/supplier/supplier';

@Component({
  selector: 'app-purchase-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
  providers: [PurchaseOrderService, SupplierService, LogsService]
})
export class PurchaseOrderComponent implements OnInit, AfterViewInit {

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

  constructor(private _purchaseOrderService: PurchaseOrderService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _logService: LogsService,
              private _supplierService: SupplierService,
              public media: TdMediaService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog) {
    this.page.size = 50;
    this.page.pageNumber = 0;
  }

  ngOnInit() {
    this.getSupplierData();
    this.load();
  }

  ngAfterViewInit(): void {
    this.media.broadcast();
    this._changeDetectorRef.detectChanges();
  }

  load() {
    this.loading = true;
    this._purchaseOrderService.requestData().subscribe((snapshot) => {
      this._purchaseOrderService.rows = [];
      snapshot.forEach((s) => {
        const _row = new PurchaseOrder(s.val());
        this.suppliers.forEach((sup) => {
          if (_row.supplier === sup.code) {
            _row.supplier_name1 = sup.name1;
            _row.supplier_name2 = sup.name2;
          }
        });
        this._purchaseOrderService.rows.push(_row);
      });

      this.temp = [...this._purchaseOrderService.rows];
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

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

  addData() {
    const dialogRef = this.dialog.open(PurchaseOrderDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Create', 'Create purchase order by item succeed', result, {});
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  editData(data: PurchaseOrder) {
    const dialogRef = this.dialog.open(PurchaseOrderDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Update', 'Update purchase order succeed', result, data);
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  deleteData(data: PurchaseOrder) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'delete',
        title: 'Delete purchase order',
        content: 'Confirm to delete?',
        data_title: 'Purchase Order',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseOrderService.removeData(data).then(() => {
          this.snackBar.open('Delete purchase order succeed', '', {duration: 3000});
          this.addLog('Delete', 'Delete purchase order succeed', data, {});

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  enableData(data: PurchaseOrder) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'enable',
        title: 'Enable purchase order',
        content: 'Purchase order with enabled will be able to use',
        data_title: 'Purchase Order',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseOrderService.updateDataStatus(data, false).then(() => {
          this.snackBar.open('Enable purchase order succeed', '', {duration: 3000});

          const new_data = new PurchaseOrder(data);
          new_data.disable = false;
          this.addLog('Enable', 'Enable purchase order succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  disableData(data: PurchaseOrder) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'disable',
        title: 'Disable purchase order',
        content: 'Purchase order with disabled are not able to use',
        data_title: 'Purchase Order',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseOrderService.updateDataStatus(data, true).then(() => {
          this.snackBar.open('Disable purchase order succeed', '', {duration: 3000});

          const new_data = new PurchaseOrder(data);
          new_data.disable = false;
          this.addLog('Disable', 'Disable purchase order succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  openLogs(data: PurchaseOrder) {
    this.dialog.open(LogsDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data: {
        menu: 'Purchase Order',
        path: this._purchaseOrderService.getPath(),
        ref: data ? data.code : null
      },
    });
  }

  addLog(operation: string, description: string, data: any, old: any): void {
    const log = new Logs({});
    log.path = this._purchaseOrderService.getPath();
    log.ref = data.code;
    log.operation = operation;
    log.description = description;
    log.old_data = old;
    log.new_data = data;
    this._logService.addLog(this._purchaseOrderService.getPath(), log);
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
        (d.name && d.name.toLowerCase().indexOf(val) !== -1)
        || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}

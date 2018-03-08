import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TdMediaService } from '@covalent/core';
import { Language } from 'angular-l10n';
import { Page } from '../../../shared/model/page';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmComponent } from '../../../dialog/confirm/confirm.component';
import { Logs } from '../../../dialog/logs-dialog/logs';
import { LogsService } from '../../../dialog/logs-dialog/logs.service';
import { LogsDialogComponent } from '../../../dialog/logs-dialog/logs-dialog.component';
import { PurchaseRequisitionService } from '../purchase-requisition/purchase-requisition.service';
import { PurchaseRequisition } from '../purchase-requisition/purchase-requisition';
import { PurchaseRequisitionDialogComponent } from './purchase-requisition-dialog/purchase-requisition-dialog.component';
import { Comparison } from '../comparison/comparison';
import { PurchaseOrder } from '../purchase-order/purchase-order';

@Component({
  selector: 'app-purchase-purchase-requisition',
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss'],
  providers: [PurchaseRequisitionService, LogsService]
})
export class PurchaseRequisitionComponent implements OnInit, AfterViewInit {

  @Language() lang: string;
  @ViewChild('dataTable') table: any;

  loading: boolean = true;
  menu_expand: boolean = true;

  page = new Page();
  cache: any = {};
  expanded: any = {};

  rows: any[] = [];
  temp = [];
  toDay = new Date();
  order_data: PurchaseOrder = new PurchaseOrder({});

  constructor(private _purchaseRequisitionService: PurchaseRequisitionService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _logService: LogsService,
              public media: TdMediaService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog) {
    this.page.size = 50;
    this.page.pageNumber = 0;
  }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit(): void {
    this.media.broadcast();
    this._changeDetectorRef.detectChanges();
  }

  load() {
    this.loading = true;
    this._purchaseRequisitionService.requestData().subscribe((snapshot) => {
      this._purchaseRequisitionService.rows = [];
      snapshot.forEach((s) => {
        const _row = new Comparison(s.val());
        this._purchaseRequisitionService.rows.push(_row);
      });

      this.temp = [...this._purchaseRequisitionService.rows];
      this.loading = false;
      this.setPage(null);
    });
  }

  setPage(pageInfo) {

    if (pageInfo) {
      this.page.pageNumber = pageInfo.pageIndex;
      this.page.size = pageInfo.pageSize;
    }

    this._purchaseRequisitionService.getResults(this.page).subscribe((pagedData) => {
      this.page = pagedData.page;
      this.rows = pagedData.data;
    });

  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

  addData() {
    const dialogRef = this.dialog.open(PurchaseRequisitionDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Create', 'Create purchase requisition by item succeed', result, {});
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  editData(data: PurchaseRequisition) {
    const dialogRef = this.dialog.open(PurchaseRequisitionDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Update', 'Update purchase requisition succeed', result, data);
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  deleteData(data: PurchaseRequisition) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'delete',
        title: 'Delete purchase requisition',
        content: 'Confirm to delete?',
        data_title: 'Purchase Requisition',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseRequisitionService.removeData(data).then(() => {
          this.snackBar.open('Delete rurchase requisition succeed', '', {duration: 3000});
          this.addLog('Delete', 'Delete purchase requisition succeed', data, {});

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  approveData(data: PurchaseRequisition) {
    console.log(JSON.stringify(data));
    data.status = 'approved';
  }

  cancelData(data: PurchaseRequisition) {
    data.status = 'canceled';
  }

  retractData(data: PurchaseRequisition) {
    data.status = 'pending';
  }
/*
  generateCode() {
    // this._loadingService.register('data.form');
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
      // this._loadingService.resolve('data.form');
    });
  }
*/
  enableData(data: PurchaseRequisition) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'enable',
        title: 'Enable purchase requisition',
        content: 'Purchase requisition with enabled will be able to use',
        data_title: 'Purchase Requisition',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseRequisitionService.updateDataStatus(data, false).then(() => {
          this.snackBar.open('Enable purchase requisition succeed', '', {duration: 3000});

          const new_data = new PurchaseRequisition(data);
          new_data.disable = false;
          this.addLog('Enable', 'Enable purchase requisition succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });

  }

  disableData(data: PurchaseRequisition) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'disable',
        title: 'Disable purchase requisition',
        content: 'Purchase requisition with disabled are not able to use',
        data_title: 'Purchase Requisition',
        data: data.code + ' : ' + data.name
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.snackBar.dismiss();
        this._purchaseRequisitionService.updateDataStatus(data, true).then(() => {
          this.snackBar.open('Disable purchase requisition succeed', '', {duration: 3000});

          const new_data = new PurchaseRequisition(data);
          new_data.disable = false;
          this.addLog('Disable', 'Disable purchase requisition succeed', new_data, data);

        }).catch((err) => {
          this.snackBar.open('Error : ' + err.message, '', {duration: 3000});
        });
      }
    });
  }

  openLogs(data: PurchaseRequisition) {
    this.dialog.open(LogsDialogComponent, {
      disableClose: true,
      maxWidth: '100vw',
      width: '100%',
      height: '100%',
      data: {
        menu: 'Purchase Requisition',
        path: this._purchaseRequisitionService.getPath(),
        ref: data ? data.code : null
      },
    });
  }

  addLog(operation: string, description: string, data: any, old: any): void {
    const log = new Logs({});
    log.path = this._purchaseRequisitionService.getPath();
    log.ref = data.code;
    log.operation = operation;
    log.description = description;
    log.old_data = old;
    log.new_data = data;
    this._logService.addLog(this._purchaseRequisitionService.getPath(), log);
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

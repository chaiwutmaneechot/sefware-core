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

@Component({
  selector: 'app-purchase-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  providers: [ComparisonService, SupplierService]
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

  compare_bys = [
    {value: 'by_item', viewValue: 'By Item'},
    {value: 'by_supplier', viewValue: 'By Supplier'}
  ];

  constructor(private _comparisonService: ComparisonService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _logService: LogsService,
              private _supplierService: SupplierService,
              public media: TdMediaService,
              public snackBar: MatSnackBar,
              private dialog: MatDialog) {

    this.page.size = 50;
    this.page.pageNumber = 0;

  }

  ngOnInit(): void {
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
        this._comparisonService.rows.push(_row);

      });

      this.temp = [...this._comparisonService.rows];
      this.loading = false;
      this.setPage(null);
    });
  }

  getSupplierData(code) {
    this._supplierService.requestDataByCode(code).subscribe((snapshot) => {
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

    this._comparisonService.getResults(this.page).subscribe((pagedData) => {
      this.page = pagedData.page;
      this.rows = pagedData.data;
    });

  }

  toggleMenu() {
    this.menu_expand = !this.menu_expand;
  }

  addData() {
    /*const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      width: '100%',
      height: '100%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addLog('Create', 'create driver succeed', result, {});
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });*/
  }

  addItemData() {
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
        (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
        (d.supplier && d.supplier.toLowerCase().indexOf(val) !== -1) ||
        (d.period_from && d.period_from.toLowerCase().indexOf(val) !== -1) ||
        (d.period_to && d.period_to.toLowerCase().indexOf(val) !== -1) ||
        (d.remark && d.remark.toLowerCase().indexOf(val) !== -1)
        || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}

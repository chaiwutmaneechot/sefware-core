import { Injectable } from '@angular/core';
import { Page } from '../../../shared/model/page';
import { Observable } from 'rxjs/Rx';
import { PagedData } from '../../../shared/model/paged-data';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { PurchaseOrder } from './purchase-order';

@Injectable()
export class PurchaseOrderService {

  lists: FirebaseListObservable<any>;
  rows: PurchaseOrder [] = [];
  _path: string = '/main/purchase/purchase_order';

  constructor(private agFb: AngularFireDatabase) {
    this.lists = agFb.list(this._path, {preserveSnapshot: true});
  }

  getPath(): string {
    return this._path;
  }

  requestData() {
    return this.lists;
  }

  addData(data: PurchaseOrder) {
    return this.lists.update(data.code, data);
  }

  updateData(data: PurchaseOrder) {
    return this.lists.update(data.code, data);
  }

  updateDataStatus(data: PurchaseOrder, active: boolean) {
    return this.lists.update(data.code, {
      disable: active
    });
  }

  removeData(data: PurchaseOrder) {
    return this.lists.remove(data.code);
  }

  requestLastData(prefix: string) {
    return this.agFb.list(this._path, {
      query: {
        orderByChild: 'code',
        startAt: prefix,
        limitToLast: 1
      }
    });
  }

  public getResults(page: Page): Observable<PagedData<PurchaseOrder>> {
    return Observable.of(this.rows).map((data) => this.getPagedData(page));
  }

  private getPagedData(page: Page): PagedData<PurchaseOrder> {
    const pagedData = new PagedData<PurchaseOrder>();
    page.totalElements = this.rows.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = this.rows[i];
      pagedData.data.push(new PurchaseOrder(jsonObj));
    }
    pagedData.page = page;
    return pagedData;
  }
}

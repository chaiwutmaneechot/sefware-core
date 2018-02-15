import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { Page } from '../../../shared/model/page';
import { Observable } from 'rxjs/Rx';
import { PagedData } from '../../../shared/model/paged-data';
import { PurchaseRequisition } from './purchase-requisition';

@Injectable()
export class PurchaseRequisitionService {

  lists: FirebaseListObservable<any>;
  rows: PurchaseRequisition [] = [];
  _path: string = '/main/purchase/purchase_requisition';

  constructor(private agFb: AngularFireDatabase) {
    this.lists = agFb.list(this._path, {preserveSnapshot: true});
  }

  getPath(): string {
    return this._path;
  }

  requestData() {
    return this.lists;
  }

  addData(data: PurchaseRequisition) {
    return this.lists.update(data.code, data);
  }

  updateData(data: PurchaseRequisition) {
    return this.lists.update(data.code, data);
  }

  updateDataStatus(data: PurchaseRequisition, active: boolean) {
    return this.lists.update(data.code, {
      disable: active
    });
  }

  removeData(data: PurchaseRequisition) {
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

  public getResults(page: Page): Observable<PagedData<PurchaseRequisition>> {
    return Observable.of(this.rows).map((data) => this.getPagedData(page));
  }

  private getPagedData(page: Page): PagedData<PurchaseRequisition> {
    const pagedData = new PagedData<PurchaseRequisition>();
    page.totalElements = this.rows.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = this.rows[i];
      pagedData.data.push(new PurchaseRequisition(jsonObj));
    }
    pagedData.page = page;
    return pagedData;
  }

}

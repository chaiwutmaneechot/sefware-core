import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { Page } from '../../../shared/model/page';
import { Observable } from 'rxjs/Rx';
import { PagedData } from '../../../shared/model/paged-data';
import { GoodsReceive } from './goods-receive';

@Injectable()
export class GoodsReceiveService {


  lists: FirebaseListObservable<any>;
  rows: GoodsReceive [] = [];
  _path: string = '/main/purchase/goods_receive';

  constructor(private agFb: AngularFireDatabase) {
    this.lists = agFb.list(this._path, {preserveSnapshot: true});
  }

  getPath(): string {
    return this._path;
  }

  requestData() {
    return this.lists;
  }

  addData(data: GoodsReceive) {
    return this.lists.update(data.code, data);
  }

  updateData(data: GoodsReceive) {
    return this.lists.update(data.code, data);
  }

  updateDataStatus(data: GoodsReceive, active: boolean) {
    return this.lists.update(data.code, {
      disable: active
    });
  }

  removeData(data: GoodsReceive) {
    return this.lists.remove(data.code);
  }

  requestLastData() {
    return this.agFb.list(this._path, {
      query: {
        limitToLast: 1
      }
    });
  }

  public getResults(page: Page): Observable<PagedData<GoodsReceive>> {
    return Observable.of(this.rows).map((data) => this.getPagedData(page));
  }

  private getPagedData(page: Page): PagedData<GoodsReceive> {
    const pagedData = new PagedData<GoodsReceive>();
    page.totalElements = this.rows.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = this.rows[i];
      pagedData.data.push(new GoodsReceive(jsonObj));
    }
    pagedData.page = page;
    return pagedData;
  }
}

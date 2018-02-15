import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database-deprecated';
import {Page} from '../../../shared/model/page';
import {Observable} from 'rxjs';
import {PagedData} from '../../../shared/model/paged-data';
import { ItemWithCompare, ListSupplier } from './item-with-compare';

@Injectable()
export class ItemWithComparisonService {
  lists: FirebaseListObservable<any>;
  rows: ItemWithCompare [] = [];
  _path: string = '/main/purchase/item_with_compare';

  constructor(private agFb: AngularFireDatabase) {
    this.lists = agFb.list(this._path, {preserveSnapshot: true});
  }

  getPath(): string {
    return this._path;
  }

  requestData() {
    return this.lists;
  }

  requestDataByCode(code: string) {
    return this.agFb.list(this._path, {
      query: {
        orderByChild: 'code',
        equalTo: code
      }
    });  }

  addData(data: ItemWithCompare) {
    return this.lists.update(data.code, data);
  }

  updateData(data: ItemWithCompare) {
    return this.lists.update(data.code, data);
  }

  updateDataStatus(data: ItemWithCompare, active: boolean) {
    return this.lists.update(data.code, {
      disable: active
    });
  }

  removeData(data: ItemWithCompare) {
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

  public getResults(page: Page): Observable<PagedData<ItemWithCompare>> {
    return Observable.of(this.rows).map((data) => this.getPagedData(page));
  }

  private getPagedData(page: Page): PagedData<ItemWithCompare> {
    const pagedData = new PagedData<ItemWithCompare>();
    page.totalElements = this.rows.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = this.rows[i];
      pagedData.data.push(new ItemWithCompare(jsonObj));
    }
    pagedData.page = page;
    return pagedData;
  }
}

import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database-deprecated';
import {Injectable} from '@angular/core';

import {Http, URLSearchParams} from '@angular/http';
import {environment} from '../../../../environments/environment';
import { PagedData } from '../../../shared/model/paged-data';
import { Page } from '../../../shared/model/page';
import { Observable } from 'rxjs/Rx';
import { User } from './user';

@Injectable()
export class UserService {

  users: FirebaseListObservable<any>;
  rows: User [] = [];

  constructor(private af: AngularFireDatabase,
              private http: Http) {
    this.users = this.af.list('/users', {preserveSnapshot: true});
  }

  requestUser() {
    return this.users;
  }

  addUser() {

  }

  updateUser() {

  }

  disableUserFromAdmin(uid: string, disabled: string) {
    const data = new URLSearchParams();
    data.append('uid', uid);
    data.append('disabled', disabled);
    return this.http
      .post(environment.api + '/disableUser', data);
  }

  disableUser(uid: string) {
    return this.users.update(uid, {disabled: true});
  }

  enableUser(uid: string) {
    return this.users.update(uid, {disabled: false});
  }

  deleteUser(uid: string) {
    const data = new URLSearchParams();
    data.append('uid', uid);
    this.http
      .post(environment.api + '/deleteUser', data);
    return this.users.remove(uid);
  }

  public getResults(page: Page): Observable<PagedData<User>> {
    return Observable.of(this.rows).map((data) => this.getPagedData(page));
  }

  private getPagedData(page: Page): PagedData<User> {
    const pagedData = new PagedData<User>();
    page.totalElements = this.rows.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = this.rows[i];
      pagedData.data.push(new User(jsonObj));
    }
    pagedData.page = page;
    return pagedData;
  }
}

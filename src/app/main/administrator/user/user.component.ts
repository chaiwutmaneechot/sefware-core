import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import {User} from './user-model';
import {UserService} from './user.service';
import {UserAddComponent} from './user-add/user-add.component';
import {ConfirmComponent} from '../../../dialog/confirm/confirm.component';
import {AuthService} from '../../../login/auth.service';
import * as firebase from 'firebase/app';
import {Language} from 'angular-l10n';
import {ResetPasswordComponent} from '../../../dialog/reset-password/reset-password.component';
import { Page } from '../../../shared/model/page';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [UserService],
})
export class UserComponent implements OnInit {
  @Language() lang: string;
  processing: boolean = true;
  page = new Page();
  rows: any[] = [];

  user: firebase.User;

  constructor(public userservice: UserService,
              private authService: AuthService,
              private dialog: MatDialog) {
    authService.user.subscribe((user) => {
      this.user = user;
    });

    this.page.size = 50;
    this.page.pageNumber = 0;
  }

  ngOnInit() {
    this.refreshData();
  }

  setPage(pageInfo) {

    if (pageInfo) {
      this.page.pageNumber = pageInfo.pageIndex;
      this.page.size = pageInfo.pageSize;
    }

    this.userservice.getResults(this.page).subscribe((pagedData) => {
      this.page = pagedData.page;
      this.rows = pagedData.data;
    });

  }

  refreshData() {
    this.processing = true;
    this.userservice.requestUser().subscribe((snapshot) => {
      this.rows = [];
      snapshot.forEach((s) => {
        const _data = s.val();
        _data.uid = s.key;
        this.rows.push(_data);
      });
      this.processing = false;
    });
  }

  addUser() {
    const dialogRef =  this.dialog.open(UserAddComponent, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  editUser(user: User) {
    const dialogRef =  this.dialog.open(UserAddComponent, {
      disableClose: true,
      data: user
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // this.msgs = [];
        // this.msgs.push({severity: 'success', detail: 'Data updated'});
      }
    });
  }

  deleteUser(user: User) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'delete',
        title: 'Delete account',
        content: 'After you delete an account, it\'s permanently deleted, Accounts cannot be recovered',
        data_title: 'User account',
        data: user.email
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.userservice.deleteUser(user.uid).then((_) => {
          // this.msgs = [];
          // this.msgs.push({severity: 'success', detail: 'Data updated'});
        })
          .catch((err) => {
            // this.msgs = [];
            // this.msgs.push({severity: 'error', detail: err.message});
          });
      }
    });
  }

  enableUser(user: User) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'enable',
        title: 'Enable account',
        content: 'Users with enabled accounts will be able to sign in again',
        data_title: 'User account',
        data: user.email
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.userservice.disableUserFromAdmin(user.uid, 'false').subscribe((_data) => {
          // console.log(_data.json().uid);
          this.userservice.enableUser(user.uid).then((_) => {
            // this.msgs = [];
            // this.msgs.push({severity: 'success', detail: 'Data updated'});
          })
            .catch((err) => {
              // this.msgs = [];
              // this.msgs.push({severity: 'error', detail: err.message});
            });
        }, (error) => {
          return error;
        });
      }
    });

  }

  disableUser(user: User) {
    this.dialog.open(ConfirmComponent, {
      data: {
        type: 'disable',
        title: 'Disable account',
        content: 'Users with disabled accounts aren\'t able to sign in',
        data_title: 'User account',
        data: user.email
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.userservice.disableUserFromAdmin(user.uid, 'true').subscribe((_data) => {
          // console.log(_data.json().uid);
          this.userservice.disableUser(user.uid).then((_) => {
            // this.msgs = [];
            // this.msgs.push({severity: 'success', detail: 'Data updated'});
          })
            .catch((err) => {
              // this.msgs = [];
              // this.msgs.push({severity: 'error', detail: err.message});
            });
        }, (error) => {
          return error;
        });
      }
    });
  }

  resetPassword(user: User) {
    this.dialog.open(ResetPasswordComponent, {
      data: {
        type: 'reset_password',
        title: 'Reset password',
        content: 'Send a password reset email',
        data_title: 'User account',
        data: user.email
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.authService.resetPassword(user.email).then((_) => {
          // this.msgs = [];
          // this.msgs.push({severity: 'success', detail: 'Password reset email has been sent'});
        })
          .catch((err) => {
            // this.msgs = [];
            // this.msgs.push({severity: 'error', detail: err.message});
          });
      }
    });
  }

}

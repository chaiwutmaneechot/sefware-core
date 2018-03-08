import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {User} from '../user-model';
import {AngularFireDatabase} from 'angularfire2/database-deprecated';
import {Http, URLSearchParams} from '@angular/http';
import {environment} from '../../../../../environments/environment';
import {Language, Translation} from 'angular-l10n';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss'],
})
export class UserAddComponent {
  @Language() lang: string;

  processing = false;
  data: User = new User();
  error: any;

  constructor(@Inject(MAT_DIALOG_DATA) public md_data: User,
              private afDb: AngularFireDatabase,
              public dialogRef: MatDialogRef<UserAddComponent>,
              public http: Http) {
    if (md_data) {
      this.data.uid = md_data.uid;
      this.data.email = md_data.email;
      this.data.displayName = md_data.displayName;
    }
  }

  saveUser(form) {

    if (form.valid) {
      this.error = false;
      this.processing = true;

      if (this.md_data) {
        // edit user
        const data = new URLSearchParams();
        data.append('email', form.value.email);
        data.append('password', form.value.password);
        data.append('displayName', form.value.displayName);
        data.append('uid', this.data.uid);

        // update user
        this.http
          .post(environment.api + '/updateUser', data)
          .subscribe((_data) => {
            // console.log(_data.json().uid);
            this.afDb.object('users/' + _data.json().uid).update({
              uid: _data.json().uid,
              displayName: _data.json().displayName,
              email: _data.json().email,
              photoURL: _data.json().photoURL,
              disabled: false,
              online: false,
              lastOnline: '-'
            }).then((success) => {
              this.dialogRef.close(true);
            }).catch((error) => {
              this.processing = false;
              this.error = error;
            });
          }, (error) => {
            this.processing = false;
            this.error = error.json().message;
          });
      } else {

        const data = new URLSearchParams();
        data.append('email', form.value.email);
        data.append('password', form.value.password);
        data.append('displayName', form.value.displayName);

        this.http
          .post(environment.api + '/addUser', data)
          .subscribe((_data) => {
            this.afDb.object('users/' + _data.json().uid).update({
              uid: _data.json().uid,
              displayName: _data.json().displayName,
              email: _data.json().email,
              photoURL: _data.json().photoURL,
              disabled: false,
              online: false,
              lastOnline: '-'
            }).then((success) => {
              this.dialogRef.close(true);
            }).catch((error) => {
              this.processing = false;
              this.error = error;
            });
          }, (error) => {
            this.processing = false;
            this.error = error.json().message;
          });
      }
    }
  }
}

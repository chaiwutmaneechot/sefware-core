import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UserComponent} from './user.component';

const USER_ROUTER: Routes = [
  {
    path: '',
    component: UserComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(USER_ROUTER)
  ],
  exports: [
    RouterModule
  ],
  providers: [

  ]
})

export class UserRouting {}

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RoleComponent} from './role.component';

const ROLE_ROUTER: Routes = [
  {
    path: '',
    component: RoleComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROLE_ROUTER)
  ],
  exports: [
    RouterModule
  ],
  providers: [

  ]
})

export class RoleRouting {}

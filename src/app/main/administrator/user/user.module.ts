import {NgModule} from '@angular/core';
import {UserRouting} from './user.routing';
import {UserComponent} from './user.component';

import {CommonModule} from '@angular/common';
import {LocaleService, TranslationModule, TranslationService} from 'angular-l10n';
import {SharedModule} from '../../../shared/shared.module';
import {UserAddComponent} from './user-add/user-add.component';

@NgModule({
  imports: [
    CommonModule,
    UserRouting,
    SharedModule,
    TranslationModule.forChild(),

  ],
  declarations: [
    UserComponent,
    UserAddComponent
  ],
  entryComponents: [
    UserAddComponent
  ],
  providers: [

  ]
})

export class UserModule {

  constructor(public locale: LocaleService, public translation: TranslationService) {

    this.locale.addConfiguration()
      .addLanguages(['en', 'th', 'ko'])
      .setCookieExpiration(30)
      .defineLanguage('en');
    this.translation.addConfiguration()
      .addProvider('./assets/locale/main-admin-user/');
    this.translation.init();
  }
}

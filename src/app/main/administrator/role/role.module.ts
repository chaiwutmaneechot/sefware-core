import {NgModule} from '@angular/core';
import {RoleRouting} from './role.routing';
import {RoleComponent} from './role.component';

import {CommonModule} from '@angular/common';
import {LocaleService, TranslationModule, TranslationService} from 'angular-l10n';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RoleRouting,
    SharedModule,
    TranslationModule.forChild(),

  ],
  declarations: [
    RoleComponent,
  ],
  entryComponents: [

  ],
  providers: [

  ]
})

export class RoleModule {

  constructor(public locale: LocaleService, public translation: TranslationService) {

    this.locale.addConfiguration()
      .addLanguages(['en', 'th', 'ko'])
      .setCookieExpiration(30)
      .defineLanguage('en');
    this.translation.addConfiguration()
      .addProvider('./assets/locale/main-admin-role/');
    this.translation.init();
  }
}

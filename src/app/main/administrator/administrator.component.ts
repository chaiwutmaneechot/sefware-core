import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Language, LocaleService } from 'angular-l10n';
import { Router } from '@angular/router';
import { TdMediaService } from '@covalent/core';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.scss']
})
export class AdministratorComponent implements OnInit, AfterViewInit {
  @Language() lang: string;

  constructor(public locale: LocaleService,
              public router: Router,
              private _changeDetectorRef: ChangeDetectorRef,
              public media: TdMediaService) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.media.broadcast();
    this._changeDetectorRef.detectChanges();
  }
}

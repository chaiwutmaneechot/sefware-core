import { Component, OnInit } from '@angular/core';
import { Language, LocaleService } from 'angular-l10n';

@Component({
  selector: 'app-purchase-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit {

  @Language() lang: string;

  constructor(public locale: LocaleService) {
  }

  ngOnInit() {
  }

}

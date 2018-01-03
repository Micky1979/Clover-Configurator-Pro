import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  moduleId: module.id.toString(),
  selector: 'ccphp-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {

    this.translate.addLangs(['en', 'it', 'es', 'fr']);
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(browserLang.match(/en|it|es|fr/) ? browserLang : 'en');
  }

  ngOnInit() { }

}

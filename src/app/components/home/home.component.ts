import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccphp-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  title = '';

  constructor() {
    this.title = 'Clover Configurator Pro';
  }

  ngOnInit() {
  }

}

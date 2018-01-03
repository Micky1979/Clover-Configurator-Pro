import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id.toString(),
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public title: string;

  constructor() {
    this.title = 'Clover Configurator Pro';
  }

  ngOnInit() { }

}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Main Components
import {
  HomeComponent,
  InformationComponent,
  AboutComponent,
  ErrorsComponent
} from './layout/main/index';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'information', component: InformationComponent },
  { path: 'about', component: AboutComponent },
  // otherwise redirect to error page
  { path: '**', component: ErrorsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }

export const routedComponents = [HomeComponent, InformationComponent, AboutComponent, ErrorsComponent];

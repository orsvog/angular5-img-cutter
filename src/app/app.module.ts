import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { RabbiCutterModule } from './rabbi-cutter/rabbi-cutter.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RabbiCutterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

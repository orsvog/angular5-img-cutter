import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RabbiCutterComponent } from './rabbi-cutter.component';
import { RabbiCutterService } from './rabbi-cutter.service';

@NgModule({
  imports: [CommonModule],
  exports: [RabbiCutterComponent],
  declarations: [RabbiCutterComponent],
  providers: [RabbiCutterService]
})
export class RabbiCutterModule { }

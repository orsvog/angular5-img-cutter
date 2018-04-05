import { Component, Input, ViewChild, OnInit, ElementRef } from '@angular/core';
import { RabbiCutterOptionsModel } from './models/rabbi-cutter-options.model';
import { RabbiCutterService } from './rabbi-cutter.service';
import { RabbiCutterModel } from './models/rabbi-cutter.model';

@Component({
  selector: 'rabbi-cutter',
  templateUrl: './rabbi-cutter.component.html',
  styles: []
})

export class RabbiCutterComponent implements OnInit {
  @Input('options') options: RabbiCutterOptionsModel;
  @Input('imageSrc') imageSrc: any;
  @ViewChild('canvas') canvasRef: ElementRef;

  constructor(
    private rabbiCutterService: RabbiCutterService
  ) { }

  ngOnInit() {
    if (!this.imageSrc) {
      return;
    }
    this.rabbiCutterService.init(this.canvasRef.nativeElement, this.options);
    this.loadImage(this.imageSrc);
  }

  ngOnChange() {
    if (!this.imageSrc) {
      return;
    }
    this.rabbiCutterService.init(this.canvasRef.nativeElement, this.options);
    this.loadImage(this.imageSrc);
  }

  private loadImage(src) {
    this.rabbiCutterService.loadImage(src)
      .then(msg => {
        console.log('image loaded');
      })
      .catch(msg => {
        console.log('image not loaded');
      });
  }
}

import { Component } from '@angular/core';
import { exampleImage } from './image';

@Component({
  selector: 'app-root',
  template: `
    <rabbi-cutter [imageSrc]="imageSrc"></rabbi-cutter>
  `,
  styles: []
})
export class AppComponent {
  imageSrc = exampleImage;
  title = 'app';
}

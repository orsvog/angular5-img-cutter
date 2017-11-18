import { Component } from '@angular/core';
import { exampleImage } from './image';

@Component({
  selector: 'app-root',
  template: `
    <div style="width: 600px; height: 400px">
      <rabbi-cutter [imageSrc]="imageSrc"></rabbi-cutter>
    </div>
  `,
  styles: []
})
export class AppComponent {
  imageSrc = exampleImage;
  title = 'app';
}

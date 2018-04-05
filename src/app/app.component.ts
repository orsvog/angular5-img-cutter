import { Component } from '@angular/core';
import { exampleImage } from './image';
import { RabbiCutterOptionsModel } from './rabbi-cutter/models/rabbi-cutter-options.model';
import { SizeRuleEnum, ShapeEnum } from './rabbi-cutter/models/enums';
import { CropWindowModel } from './rabbi-cutter/models/crop-window.model';
import { PositionModel } from './rabbi-cutter/models/position.model';
import { SizeModel } from './rabbi-cutter/models/size.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  imageSrc = exampleImage;
  options: RabbiCutterOptionsModel;

  showMenu = false;
  showRabbiCutter = true;
  SHAPE = ShapeEnum;
  SIZE_RULE = SizeRuleEnum;

  constructor() {
    this.options = RabbiCutterOptionsModel.fromJSON({
      canvasScale: 1,
      resizeRect: 10,
      sizeRule: SizeRuleEnum.contain,
      cropWindow: CropWindowModel.fromJSON({
        shape: ShapeEnum.rectangle,
        pos: new PositionModel(100, 40),
        size: new SizeModel(250, 250),
        color: '#fff',
        allowResize: true
      })
    });
  }


  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  updateShape(shape: ShapeEnum) {
    this.options.cropWindow.shape = shape;
    this.redrawCutter();
  }

  updateCropSize(x, y) {
    console.log(x,y);
    this.options.cropWindow.size = new SizeModel(x, y);
    this.redrawCutter();
  }

  getCropSize() { }

  downloadImage() { }

  updateStyles(sizeRule: SizeRuleEnum) {
    this.options.sizeRule = sizeRule;
    this.redrawCutter();
  }

  private redrawCutter() {
    // temporaly update, need to trigger cutter component ngChange
    this.showRabbiCutter = false;
    setTimeout(() => {
      this.showRabbiCutter = true;
    });
  }
}

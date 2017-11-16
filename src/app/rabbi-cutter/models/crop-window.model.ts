import { PositionModel } from './position.model';
import { SizeModel } from './size.model';
import { ShapeEnum } from './enums';
export class CropWindowModel {
    constructor(
        public shape: ShapeEnum,
        public pos: PositionModel,
        public size: SizeModel,
        public color: string,
        public allowResize: Boolean
    ) { }

    static fromJSON(object: any): CropWindowModel {
        return new CropWindowModel(
            object['shape'],
            PositionModel.fromJSON(object['pos'] || {}),
            SizeModel.fromJSON(object['size'] || {}),
            object['color'],
            object['allowResize']
        );
    }
}







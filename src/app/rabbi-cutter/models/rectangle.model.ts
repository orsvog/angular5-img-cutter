import { SizeModel } from './size.model';
import { PositionModel } from './position.model';
export class RectangleModel {

    constructor(
        public size: SizeModel,
        public pos: PositionModel
    ) { }

    static fromJSON(object: any): RectangleModel {
        return new RectangleModel(
            SizeModel.fromJSON(object['size'] || {}),
            PositionModel.fromJSON(object['pos'] || {})
        );
    }
}

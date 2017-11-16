import { CropWindowModel } from './crop-window.model';
import { SizeRuleEnum } from './enums';
export class RabbiCutterOptionsModel {
    constructor(
        public canvasScale: number,
        public resizeRect: number,
        public sizeRule: SizeRuleEnum,
        public cropWindow: CropWindowModel
    ) { }

    static fromJSON(object: any): RabbiCutterOptionsModel {
        return new RabbiCutterOptionsModel(
            object['canvasScale'],
            object['resizeRect'],
            object['sizeRule'],
            CropWindowModel.fromJSON(object['cropWindow'] || {})
        );
    }
}

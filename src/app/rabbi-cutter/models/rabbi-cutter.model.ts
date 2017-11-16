import { CropWindowModel } from './crop-window.model';
import { SizeRuleEnum } from './enums';
import { RabbiCutterOptionsModel } from './rabbi-cutter-options.model';

export class RabbiCutterModel {

    constructor(
        public context: CanvasRenderingContext2D,
        public canvas: Element,
        public canvasParent: Element,
        public preview: Element,
        public options: RabbiCutterOptionsModel
    ) { }

    static fromJSON(object: any): RabbiCutterModel {
        return new RabbiCutterModel(
            object['context'],
            object['canvasRef'],
            object['canvasParentRef'],
            object['previewRef'],
            RabbiCutterOptionsModel.fromJSON(object['options'] || {})
        );
    }
}

import { PositionModel } from './position.model';
import { cropActionEnum } from './enums';

export class LastEventModel {

    constructor(
        public pos: PositionModel,
        public cropAction: cropActionEnum
    ) { }

    static fromJSON(object: any): LastEventModel {
        return new LastEventModel(
            PositionModel.fromJSON(object['pos'] || {}),
            object['cropAction']
        );
    }
}

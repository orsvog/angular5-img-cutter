export class PositionModel {

    constructor(
        public x: number,
        public y: number
    ) { }

    static fromJSON(object: any): PositionModel {
        return new PositionModel(
            object['x'],
            object['y']
        );
    }
}

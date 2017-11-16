export class SizeModel {
    constructor(
        public width: number,
        public height: number
    ) { }

    static fromJSON(object: any): SizeModel {
        return new SizeModel(
            object['width'],
            object['height']
        );
    }
}

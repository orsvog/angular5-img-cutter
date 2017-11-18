import { RabbiCutterOptionsModel } from './models/rabbi-cutter-options.model';
import { SizeRuleEnum, ShapeEnum, cropActionEnum } from './models/enums';
import { CropWindowModel } from './models/crop-window.model';
import { PositionModel } from './models/position.model';
import { SizeModel } from './models/size.model';
import { RabbiCutterModel } from './models/rabbi-cutter.model';
import { ElementRef } from '@angular/core';
import { LastEventModel } from './models/last-event.model';
import { RectangleModel } from './models/rectangle.model';

export class RabbiCutterService {
    options: RabbiCutterOptionsModel;
    private context: CanvasRenderingContext2D;
    private canvas: Element;
    private canvasParent: Element;
    private preview: Element;
    private lastEvent: LastEventModel = LastEventModel.fromJSON({});
    private crop: CropWindowModel;

    private img: HTMLImageElement;
    private isLoading: Boolean;

    private eventMouseMove = this.onMouseMove.bind(this);
    private eventMouseUp = this.onMouseUp.bind(this);

    constructor() { }

    init(canvas: Element, options: RabbiCutterOptionsModel) {
        this.options = this.mergeOptions(this.options);

        this.canvas = canvas;
        this.canvasParent = this.canvas.parentElement.parentElement;
        this.context = canvas['getContext']('2d');
        this.updateResizeRect();
        this.updateStyles();
    }

    private mergeOptions(op: RabbiCutterOptionsModel = RabbiCutterOptionsModel.fromJSON({})): RabbiCutterOptionsModel {
        return new RabbiCutterOptionsModel(
            op.canvasScale || 1,
            op.resizeRect || 14,
            op.sizeRule || SizeRuleEnum.contain,
            new CropWindowModel(
                op.cropWindow.shape || ShapeEnum.rectangle,
                new PositionModel(op.cropWindow.pos.x || 10, op.cropWindow.pos.y || 10),
                new SizeModel(op.cropWindow.size.width || 150, op.cropWindow.size.height || 150),
                op.cropWindow.color || 'white',
                op.cropWindow.allowResize || true
            )
        );
    }

    render() {
        if (!this.imageIsLoaded()) {
            return;
        }
        this.context.clearRect(0, 0, this.canvas['width'], this.canvas['height']);
        this.displayImage();
        this.updateStyles();
        this.updateScale();
        this.updateResizeRect();
        // this.fillPreview();
        if (this.isLoading) {
            this.validateCropWindowParameters();
        }
        this.drawCropWindow();

        return true;
    }

    loadImage(src) {
        this.isLoading = true;

        this.crop = CropWindowModel.fromJSON(JSON.parse(JSON.stringify(this.options.cropWindow)));
        this.img = new Image();

        return new Promise(function (resolve, reject) {
            this.img.onload = () => {
                this.render();
                this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
                this.canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
                window.addEventListener('resize', this.onResize.bind(this));

                resolve('Image has been successfully loaded');
            };

            this.img.onerror = () => {
                reject('Image couldn\'t be loaded');
            };

            this.img.src = src;
        }.bind(this));
    }

    private displayImage() {
        this.canvas['width'] = this.img.width;
        this.canvas['height'] = this.img.height;
        this.context.drawImage(this.img, 0, 0);
    }

    private imageIsLoaded() {
        return this.img && this.img.complete;
    }

    private fillPreview() {
        if (!this.crop.size || this.crop.size.width === 0 || this.crop.size.height === 0) {
            return false;
        }
        const image = this.context.getImageData(this.crop.pos.x, this.crop.pos.y, this.crop.size.width, this.crop.size.height);
        if (!image) {
            return false;
        }

        const context = this.preview['getContext']('2d');
        context.clearRect(0, 0, this.preview['width'], this.preview['height']);

        this.preview['width'] = image.width;
        this.preview['height'] = image.height;

        switch (this.crop.shape) {
            default:
            case ShapeEnum.rectangle: {
                context.drawImage(this.canvas,
                    this.crop.pos.x, this.crop.pos.y,
                    this.crop.size.width, this.crop.size.height,
                    0, 0,
                    this.preview['width'], this.preview['height']);

                break;
            } case ShapeEnum.circle: {
                context.save();
                context.beginPath();
                context.arc(this.crop.size.width / 2, this.crop.size.height / 2, this.crop.size.width / 2, 0, Math.PI * 2, true);
                context.closePath();
                context.clip();

                context.drawImage(this.canvas,
                    this.crop.pos.x, this.crop.pos.y,
                    this.crop.size.width, this.crop.size.height,
                    0, 0,
                    this.preview['width'], this.preview['height']);

                context.beginPath();
                context.arc(0, 0, this.crop.size.width / 2, 0, Math.PI * 2, true);
                context.clip();
                context.closePath();
                context.restore();
                break;
            }
        }
    }

    //events

    private onResize(e) {
        this.updateScale();
        this.updateResizeRect();
    }

    private onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const pos = new PositionModel(
            e.clientX || e.touches[0].clientX,
            e.clientY || e.touches[0].clientY
        );

        let cropAction;
        if (this.options.cropWindow.allowResize && this.inDragBounds((pos.x - rect.left) * this.options.canvasScale, (pos.y - rect.top) * this.options.canvasScale)) {
            cropAction = 'resize';
        } else if (this.inCropBounds((pos.x - rect.left) * this.options.canvasScale, (pos.y - rect.top) * this.options.canvasScale)) {
            cropAction = 'drag';
        }
        // else {
        //     //it's inside canvas, but not on crop area
        // }

        this.lastEvent.pos = pos;
        this.lastEvent.cropAction = cropAction;

        console.log(cropAction);
        if (cropAction) {
            window.addEventListener('mousemove', this.eventMouseMove);
            window.addEventListener('mouseup', this.eventMouseUp);
            this.canvas.addEventListener('touchmove', this.eventMouseMove);
            this.canvas.addEventListener('touchend', this.eventMouseUp);
        }
    }

    private onMouseUp(e) {
        e.preventDefault();
        window.removeEventListener('mousemove', this.eventMouseMove);
        window.removeEventListener('mouseup', this.eventMouseUp);
        this.canvas.addEventListener('touchmove', this.eventMouseMove);
        this.canvas.addEventListener('touchend', this.eventMouseUp);
    }

    private onMouseMove(e) {
        e.preventDefault();
        const pos = new PositionModel(
            e.clientX || e.touches[0].clientX,
            e.clientY || e.touches[0].clientY
        );
        const dx = pos.x - this.lastEvent.pos.x;
        const dy = pos.y - this.lastEvent.pos.y;

        switch (this.lastEvent.cropAction) {
            case cropActionEnum.drag:
                {
                    this.moveCropWindow(dx, dy);
                    break;
                }
            case cropActionEnum.resize:
                {
                    this.resizeCropWindow(dx, dy);
                    break;
                }
            default:
                break;
        }

        this.lastEvent.pos = pos;
        this.render();
    }

    //end events

    private updateStyles() {
        let styles;

        switch (this.options.sizeRule) {
            case SizeRuleEnum.realsize: {
                styles = {
                    width: 'auto',
                    height: 'auto'
                };
                break;
            } case SizeRuleEnum.stretchByWidth: {
                styles = {
                    width: '100%',
                    height: 'auto'
                };
                break;
            } case SizeRuleEnum.stretchByHeight: {
                styles = {
                    width: 'auto',
                    height: '100%'
                };
                break;
            }
            default:
            case SizeRuleEnum.contain: {
                if (this.canvas['width'] / this.canvas['height'] > this.canvasParent['offsetWidth'] / this.canvasParent['offsetHeight']) {
                    styles = {
                        width: '100%',
                        height: 'auto',
                        margin: 'auto'
                    };
                } else {
                    styles = {
                        width: 'auto',
                        height: '100%',
                        margin: 'auto'
                    };
                }
                break;
            }
        }

        this.canvas['style'].width = styles.width;
        this.canvas['style'].height = styles.height;
        this.canvas['style'].margin = styles.margin;
    }

    private updateScale() {
        if (this.canvas['style'].width === 'auto' && this.canvas['style'].height === 'auto') {
            this.options.canvasScale = 1
        } else if (this.canvas['style'].width === 'auto') {
            this.options.canvasScale = this.canvas['height'] / this.canvasParent['offsetHeight'];
        } else {
            this.options.canvasScale = this.canvas['width'] / this.canvasParent['offsetWidth'];
        }
    }

    private updateResizeRect() {
        if (window.innerWidth < 500) {
            this.options.resizeRect = 24;
        } else if (window.innerWidth < 1000) {
            this.options.resizeRect = 18;
        } else {
            this.options.resizeRect = 14;
        }
    }

    private validateCropWindowParameters() {
        const canvasRect: RectangleModel = {
            pos: {
                x: 0 - 10,
                y: 0 - 10
            },
            size: {
                width: this.canvas['width'] + 10,
                height: this.canvas['height'] + 10
            }
        };
        if (!this.inBounds({
            x: this.crop.pos.x,
            y: this.crop.pos.y
        }, canvasRect) ||
            !this.inBounds({
                x: this.crop.pos.x + this.crop.size.width,
                y: this.crop.pos.y + this.crop.size.height
            }, canvasRect)) {
            this.options.cropWindow = Object.assign({}, this.options.cropWindow, {
                pos: {
                    x: canvasRect.size.width / 4,
                    y: canvasRect.size.height / 4
                },
                size: {
                    width: canvasRect.size.width / 2,
                    height: canvasRect.size.height / 2
                },
            });
            this.crop = JSON.parse(JSON.stringify(this.options.cropWindow));
        }
        this.isLoading = false;
    }

    private drawCropWindow() {
        this.context.strokeStyle = this.crop.color;
        this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.context.lineWidth = 2 * this.options.canvasScale;
        this.context.setLineDash([6 * this.options.canvasScale]);

        let resizeRect;

        switch (this.crop.shape) {
            default:
            case ShapeEnum.rectangle: {
                this.context.rect(this.crop.pos.x, this.crop.pos.y, this.crop.size.width, this.crop.size.height);

                resizeRect = {
                    x1: this.crop.pos.x + this.crop.size.width - this.options.resizeRect / 2 * this.options.canvasScale,
                    y1: this.crop.pos.y + this.crop.size.height - this.options.resizeRect / 2 * this.options.canvasScale,
                    x2: this.options.resizeRect * this.options.canvasScale,
                    y2: this.options.resizeRect * this.options.canvasScale
                };
                break;
            } case ShapeEnum.circle: {
                this.context.beginPath();
                this.context.arc(this.crop.pos.x + this.crop.size.width / 2, this.crop.pos.y + this.crop.size.height / 2,
                    this.crop.size.width / 2, 0, 2 * Math.PI);

                resizeRect = {
                    x1: this.crop.pos.x + this.crop.size.width - this.options.resizeRect / 2 * this.options.canvasScale,
                    y1: this.crop.pos.y + this.crop.size.height / 2 - this.options.resizeRect / 2 * this.options.canvasScale,
                    x2: this.options.resizeRect * this.options.canvasScale,
                    y2: this.options.resizeRect * this.options.canvasScale
                };
                break;
            }
        }

        this.context.stroke();
        this.context.setLineDash([]);
        this.context.rect(this.canvas['width'], 0, -this.canvas['width'], this.canvas['height']);
        this.context.fill();

        if (this.crop.allowResize) {
            this.context.fillStyle = this.crop.color;
            this.context.fillRect(resizeRect.x1, resizeRect.y1, resizeRect.x2, resizeRect.y2);
        }
    }

    private moveCropWindow(dx, dy) {
        //top left point
        const tl = {
            x: this.crop.pos.x,
            y: this.crop.pos.y
        };
        //bottom right point
        const br = {
            x: this.crop.pos.x + this.crop.size.width,
            y: this.crop.pos.y + this.crop.size.height
        };

        let x, y;
        if ((tl.x + dx) < 0) {
            x = 0;
        } else if ((br.x + dx) > this.canvas['width']) {
            x = this.canvas['width'] - this.crop.size.width;
        } else {
            x = this.crop.pos.x + dx * this.options.canvasScale;
        }

        if ((tl.y + dy) < 0) {
            y = 0;
        } else if ((br.y + dy) > this.canvas['height']) {
            y = this.canvas['height'] - this.crop.size.height;
        } else {
            y = this.crop.pos.y + dy * this.options.canvasScale;
        }

        this.crop.pos.x = x;
        this.crop.pos.y = y;
    }

    private resizeCropWindow(dx, dy) {
        this.crop.size.width += dx * this.options.canvasScale;
        this.crop.size.height += dy * this.options.canvasScale;

        if (this.crop.size.width < 20 * this.options.canvasScale) {
            this.crop.size.width = 20 * this.options.canvasScale;
        }
        if (this.crop.size.height < 20 * this.options.canvasScale) {
            this.crop.size.height = 20 * this.options.canvasScale;
        }

        if (this.crop.shape === ShapeEnum.circle) {
            this.crop.size.height = this.crop.size.width;
        }
    }

    private inDragBounds(x, y) {
        let pos: PositionModel;
        const size: SizeModel = {
            width: this.options.resizeRect * this.options.canvasScale,
            height: this.options.resizeRect * this.options.canvasScale
        };

        switch (this.crop.shape) {
            case ShapeEnum.rectangle: {
                pos = {
                    x: this.crop.pos.x + this.crop.size.width - this.options.resizeRect / 2 * this.options.canvasScale,
                    y: this.crop.pos.y + this.crop.size.height - this.options.resizeRect / 2 * this.options.canvasScale
                };
                break;
            } case ShapeEnum.circle: {
                pos = {
                    x: this.crop.pos.x + this.crop.size.width - this.options.resizeRect / 2 * this.options.canvasScale,
                    y: this.crop.pos.y + this.crop.size.height / 2 - this.options.resizeRect / 2 * this.options.canvasScale
                };
                break;
            } default: {
                break;
            }
        }

        return this.inBounds(
            { x, y },
            RectangleModel.fromJSON({ pos, size })
        );
    }

    private inCropBounds(x, y) {
        return this.inBounds(
            { x, y },
            { pos: this.crop.pos, size: this.crop.size }
        );
    }


    private inBounds(point: PositionModel, rect: RectangleModel) {
        return point.x >= rect.pos.x &&
            point.x <= rect.pos.x + rect.size.width &&
            point.y >= rect.pos.y &&
            point.y <= rect.pos.y + rect.size.height;
    }
}

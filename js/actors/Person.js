import ImageActor from "./ImageActor.js";

const VIEWBOX_WIDTH = 70.8;
const VIEWBOX_HEIGHT = 49.65;
const BACKGROUND_WIDTH = 1920;
const BACKGROUND_HEIGHT = 1080;
const TABLE_TOP = 916;
const GREEN_SHAPE_BOUNDS = {
    "./assets/img/dude.svg": { x: 16.4, y: 28.17935, width: 42.9, height: 8.45065 },
    "./assets/img/dudeCaught.svg": { x: 19.05, y: 29.954512, width: 32.175, height: 6.337988 },
    "./assets/img/dudePenalty.svg": { x: 19.05, y: 26.272012, width: 32.175, height: 6.337988 }
};

export default class Person extends ImageActor {
    constructor(canvas) {
        super(canvas, "./assets/img/dude.svg", "transparent");

        this.normalImagePath = "./assets/img/dude.svg";
        this.caughtImagePath = "./assets/img/dudeCaught.svg";
        this.penaltyImagePath = "./assets/img/dudePenalty.svg";
        this.expressionImages = {
            [this.normalImagePath]: this.image,
            [this.caughtImagePath]: new Image(),
            [this.penaltyImagePath]: new Image()
        };
        this.expressionImages[this.caughtImagePath].src = this.caughtImagePath;
        this.expressionImages[this.penaltyImagePath].src = this.penaltyImagePath;

        this.boxRatio = 70.8 / 49.65;
        this.expressionTime = 0;

        // Ajustes de la composición del personaje sobre el fondo.
        this.layoutScale = 0.151;
        this.layoutX = 0.5;
        this.layoutY = 0.90;
    }

    // Caja fija, centrada en el fondo del aula.
    layout() {
        const s = Math.max(
            this.canvas.width / BACKGROUND_WIDTH,
            this.canvas.height / BACKGROUND_HEIGHT
        );
        const cropTop = (this.canvas.height - BACKGROUND_HEIGHT * s) / 2;
        this.width = 300 * s;
        this.height = this.width / this.boxRatio;
        this.x = this.canvas.width / 2;
        const torsoBottomOffset =
            (GREEN_SHAPE_BOUNDS[this.normalImagePath].y +
                GREEN_SHAPE_BOUNDS[this.normalImagePath].height) *
            (this.width / VIEWBOX_WIDTH);
        this.y = cropTop + TABLE_TOP * s - torsoBottomOffset;
    }

    showCaught(duration = 450) {
        this.expressionTime = duration;
        this.showExpression(this.caughtImagePath);
    }

    showPenalty(duration = 1000) {
        this.expressionTime = duration;
        this.showExpression(this.penaltyImagePath);
    }

    showExpression(imagePath) {
        this.hideImage();
        this.imagePath = imagePath;
        this.image = this.expressionImages[imagePath];
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            const bounds = GREEN_SHAPE_BOUNDS[this.imagePath];
            const normalBounds = GREEN_SHAPE_BOUNDS[this.normalImagePath];
            const viewBoxScale = this.width / VIEWBOX_WIDTH;
            const drawScale = viewBoxScale * normalBounds.width / bounds.width;
            const drawWidth = VIEWBOX_WIDTH * drawScale;
            const drawHeight = VIEWBOX_HEIGHT * drawScale;
            const anchorCenterX =
                this.x + (normalBounds.x + normalBounds.width / 2 - VIEWBOX_WIDTH / 2) * viewBoxScale;
            const anchorBottomY =
                this.y + (normalBounds.y + normalBounds.height) * viewBoxScale;
            const drawX = anchorCenterX -
                (bounds.x + bounds.width / 2 - VIEWBOX_WIDTH / 2) * drawScale - drawWidth / 2;
            const drawY = anchorBottomY -
                (bounds.y + bounds.height) * drawScale;

            ctx.drawImage(
                this.image,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );
            return;
        }

        ctx.fillStyle = this.fallbackColor;
        ctx.fillRect(
            this.x - this.width / 2,
            this.y,
            this.width,
            this.height
        );
    }

    update(deltatime) {
        if (this.expressionTime <= 0) { return; }

        this.expressionTime -= deltatime;

        if (this.expressionTime <= 0) {
            this.expressionTime = 0;
            this.showExpression(this.normalImagePath);
        }
    }
}
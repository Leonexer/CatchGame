import ImageActor from "./ImageActor.js";

const outlineImages = new Map();

export default class FallingObject extends ImageActor {
    constructor(canvas, isPenalty = false) {
        super(
            canvas,
            isPenalty ? "./assets/img/penalty.svg" : "./assets/img/object.png",
            isPenalty ? "#d62828" : "#000000"
        );
        this.canvas = canvas;
        const scale = Math.min(canvas.width / 1920, canvas.height / 1080);
        this.width = 1920 * scale * 0.05;
        this.height = this.width / this.getImageRatio();
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.1;
        this.baseSpeed = 2.5;
        this.speed = this.baseSpeed;
        this.isPenalty = isPenalty;
        this.image.addEventListener("load", () => {
            this.height = this.width / this.getImageRatio();
            if (this.y < 0) {
                this.y = -this.height;
            }

            if (!outlineImages.has(this.imagePath)) {
                const outlineImage = document.createElement("canvas");
                outlineImage.width = this.image.naturalWidth;
                outlineImage.height = this.image.naturalHeight;
                const outlineContext = outlineImage.getContext("2d");
                outlineContext.drawImage(this.image, 0, 0);
                outlineContext.globalCompositeOperation = "source-in";
                outlineContext.fillStyle = "#ffffff";
                outlineContext.fillRect(0, 0, outlineImage.width, outlineImage.height);
                outlineContext.globalCompositeOperation = "source-over";
                outlineImages.set(this.imagePath, outlineImage);
            }
        });
    }

    resize(canvas, previousWidth, previousHeight) {
        this.canvas = canvas;
        const scale = Math.min(canvas.width / 1920, canvas.height / 1080);
        this.width = 1920 * scale * 0.05;
        this.height = this.width / this.getImageRatio();
        this.x *= canvas.width / previousWidth;
        this.y *= canvas.height / previousHeight;
    }

    getImageRatio() {
        return this.image.naturalWidth > 0
            ? this.image.naturalWidth / this.image.naturalHeight
            : 1;
    }

    update(deltatime){
        if(deltatime == 0){return;}

        const acceleration = deltatime / 16.67;
        this.y += this.speed * acceleration;
    }

    draw(context) {
        if (!this.image.complete || this.image.naturalWidth === 0) {
            super.draw(context);
            return;
        }

        const outlineImage = outlineImages.get(this.imagePath);
        if (!outlineImage) {
            super.draw(context);
            return;
        }

        const imageRatio = this.image.naturalWidth / this.image.naturalHeight;
        const actorRatio = this.width / this.height;
        const drawWidth = imageRatio > actorRatio
            ? this.width
            : this.height * imageRatio;
        const drawHeight = imageRatio > actorRatio
            ? this.width / imageRatio
            : this.height;
        const drawX = this.x - drawWidth / 2;
        const drawY = this.y + (this.height - drawHeight) / 2;
        const outlineWidth = Math.max(2, Math.min(drawWidth, drawHeight) * 0.045);
        const diagonal = outlineWidth * Math.SQRT1_2;
        const offsets = [
            [-outlineWidth, 0],
            [outlineWidth, 0],
            [0, -outlineWidth],
            [0, outlineWidth],
            [-diagonal, -diagonal],
            [diagonal, -diagonal],
            [-diagonal, diagonal],
            [diagonal, diagonal]
        ];

        context.save();
        context.filter = `blur(${Math.max(0.6, outlineWidth * 0.12)}px)`;
        for (const [offsetX, offsetY] of offsets) {
            context.drawImage(
                outlineImage,
                drawX + offsetX,
                drawY + offsetY,
                drawWidth,
                drawHeight
            );
        }
        context.restore();
        context.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
    }

}
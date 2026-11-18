import ImageActor from "./ImageActor.js";

export default class Background extends ImageActor {
    constructor(canvas) {
        super(canvas, "./assets/img/Background.png", "#000000");
        this.image.onerror = () => {
            console.error(`No se pudo cargar el fondo: ${this.imagePath}`);
        };
        this.layout();
    }

    layout() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.x = this.canvas.width / 2;
        this.y = 0;
    }

    draw(ctx) {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue("--main-color")
            .trim() || "#000000";

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.image.complete) {
            return;
        }

        if (this.image.naturalWidth === 0) {
            return;
        }

        const scale = Math.max(
            this.canvas.width / this.image.naturalWidth,
            this.canvas.height / this.image.naturalHeight
        );
        const sourceWidth = this.canvas.width / scale;
        const sourceHeight = this.canvas.height / scale;
        const sourceX = (this.image.naturalWidth - sourceWidth) / 2;
        const sourceY = (this.image.naturalHeight - sourceHeight) / 2;

        ctx.drawImage(
            this.image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    resize(canvas) {
        super.resize(canvas);
        this.layout();
    }
}

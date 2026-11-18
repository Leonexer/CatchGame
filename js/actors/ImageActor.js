export default class ImageActor {
    constructor(canvas, imagePath, defaultColor = "black") {
        this.canvas = canvas;
        this.fallbackColor = defaultColor;
        this.setImage(imagePath);
    }

    setImage(imagePath) {
        this.hideImage();
        this.imagePath = imagePath;
        this.image = new Image();
        this.image.src = imagePath;
    }

    draw(context) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            const imageRatio = this.image.naturalWidth / this.image.naturalHeight;
            const actorRatio = this.width / this.height;
            let drawWidth = this.width;
            let drawHeight = this.height;

            if (imageRatio > actorRatio) {
                drawHeight = this.width / imageRatio;
            } else {
                drawWidth = this.height * imageRatio;
            }

            if (this.imagePath.toLowerCase().endsWith(".gif")) {
                this.showImageElement(drawWidth, drawHeight);
                return;
            }

            context.drawImage(
                this.image,
                this.x - drawWidth / 2,
                this.y + (this.height - drawHeight) / 2,
                drawWidth,
                drawHeight
            );
            return;
        }

        context.fillStyle = this.fallbackColor;
        context.fillRect(
            this.x - this.width / 2,
            this.y,
            this.width,
            this.height
        );
    }

    showImageElement(width, height) {
        const rect = this.canvas.getBoundingClientRect();
        this.image.style.position = "fixed";
        this.image.style.left = `${rect.left + this.x - width / 2}px`;
        this.image.style.top = `${rect.top + this.y + (this.height - height) / 2}px`;
        this.image.style.width = `${width}px`;
        this.image.style.height = `${height}px`;
        this.image.style.pointerEvents = "none";
        this.image.style.zIndex = "2";

        if (!this.image.isConnected) {
            document.body.appendChild(this.image);
        }
    }

    hideImage() {
        if (this.image?.isConnected) {
            this.image.remove();
        }
    }

    resize(canvas) {
        this.canvas = canvas;
    }
}
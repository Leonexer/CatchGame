import ImageActor from "./ImageActor.js";

export default class CloudTrail {
    constructor(canvas, imagePath, imageRatio) {
        this.imageRatio = imageRatio;
        this.scales = [0.12, 0.18, 0.26];
        this.rates = [8, 14, Infinity];
        this.bubbles = this.scales.map(() => new ImageActor(canvas, imagePath));
    }

    layout(baseWidth) {
        this.bubbles.forEach((bubble, i) => {
            bubble.width = baseWidth * this.scales[i];
            bubble.height = bubble.width / this.imageRatio;
        });
    }

    resize(canvas) {
        this.bubbles.forEach((bubble) => bubble.resize(canvas));
    }

    update(deltatime, start, end, snap = false) {
        const count = this.bubbles.length;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.hypot(dx, dy) || 1;
        const ux = dx / distance;
        const uy = dy / distance;

        this.bubbles.forEach((bubble, i) => {
            const touch = 0.4 * bubble.height;
            const offset = (count - i) * 0.12 * distance;
            const targetX = end.x - ux * (touch + offset);
            const targetY = end.y - uy * (touch + offset) - bubble.height / 2;

            if (snap) {
                bubble.x = targetX;
                bubble.y = targetY;
                return;
            }

            const alpha = Number.isFinite(this.rates[i])
                ? 1 - Math.exp(-this.rates[i] * deltatime / 1000)
                : 1;

            bubble.x += (targetX - bubble.x) * alpha;
            bubble.y += (targetY - bubble.y) * alpha;
        });
    }

    draw(ctx) {
        this.bubbles.forEach((bubble) => bubble.draw(ctx));
    }
}
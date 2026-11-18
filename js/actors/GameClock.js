export default class GameClock {
    constructor(canvas) {
        this.canvas = canvas;
        this.endingProgress = 0;
        this.endingDuration = 1500;
        this.resize(canvas);
    }

    resize(canvas) {
        this.canvas = canvas;
        const scale = Math.min(canvas.width / 1920, canvas.height / 1080);
        this.x = canvas.width * 0.5036;
        this.y = canvas.height * 0.3852;
        this.radius = 1920 * scale * 0.13;
    }

    beginEnding() {
        this.endingProgress = 0;
    }

    updateEnding(deltatime) {
        this.endingProgress = Math.min(
            1,
            this.endingProgress + deltatime / this.endingDuration
        );
    }

    draw(ctx, progress) {
        const angle = -Math.PI / 2 + Math.PI * 2 * Math.min(1, Math.max(0, progress));
        const convergence = this.endingProgress * this.endingProgress *
            (3 - 2 * this.endingProgress);
        const fixedHandAngle = -Math.PI / 2;
        const movingFixedHandAngle = -Math.PI * 7 / 12 +
            Math.PI / 12 * convergence;

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.lineCap = "round";
        ctx.lineWidth = this.radius * 0.045;
        this.drawHand(ctx, fixedHandAngle, this.radius * 0.68);
        ctx.lineWidth = this.radius * 0.04;
        this.drawHand(ctx, movingFixedHandAngle, this.radius * 0.43);

        ctx.strokeStyle = "#ff1b2d";
        ctx.lineWidth = this.radius * 0.025;
        this.drawHand(ctx, angle, this.radius * 0.84);

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawHand(ctx, angle, length) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(angle) * length,
            this.y + Math.sin(angle) * length
        );
        ctx.stroke();
    }
}

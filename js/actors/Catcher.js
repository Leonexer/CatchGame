import ImageActor from "./ImageActor.js";
import Person from "./Person.js";
import CloudTrail from "./CloudTrail.js";

const FRAME_DURATION = 1000 / 60;

export default class Catcher extends ImageActor {
    constructor(canvas) {
        super(canvas, "./assets/img/catcher.svg");
        this.canvas = canvas;

        this.imageRatio = 792 / 607.68;
        this.sizeRatio = 0.08;
        this.trailGapRatio = 0.01;

        this.person = new Person(canvas);
        this.trail = new CloudTrail(canvas, "./assets/img/catcher.svg", this.imageRatio);

        this.speed = 0;
        this.maxSpeed = 6.5;

        this.updateLayout();
        this.x = this.person.x;
        this.updateTrail(0, true);
    }

    // ---------- Layout ----------
    updateLayout() {
        this.person.layout();

        const scale = Math.min(this.canvas.width / 1920, this.canvas.height / 1080);
        const baseWidth = 1920 * scale * this.sizeRatio;
        this.width = baseWidth;
        this.height = this.width / this.imageRatio;
        this.y = this.person.y - this.canvas.height * this.trailGapRatio - this.height;
        this.x = this.person.x;

        this.trail.layout(baseWidth);
    }

    updateTrail(deltatime, snap = false) {
        this.trail.update(
            deltatime,
            { x: this.person.x, y: this.person.y },
            { x: this.x, y: this.y + this.height },
            snap
        );
    }

    // ---------- Movimiento ----------
    moveLeft(deltatime) {
        if (this.x - this.width / 2 <= 0) {
            this.speed = 0;
            return;
        }
        const frameScale = deltatime / FRAME_DURATION;
        if (this.speed > -this.maxSpeed) {
            this.speed = Math.max(-this.maxSpeed, this.speed - frameScale);
        }
    }

    moveStop(deltatime) {
        if (this.x - this.width / 2 <= 0 ||
            this.x + this.width / 2 >= this.canvas.width ||
            Math.abs(this.speed) < 0.15
        ) {
            this.speed = 0;
            return;
        }

        const frameScale = deltatime / FRAME_DURATION;
        const remainingSpeed = Math.max(0, Math.abs(this.speed) - 0.1 * frameScale);
        this.speed = Math.sign(this.speed) * remainingSpeed;
    }

    moveRight(deltatime) {
        if (this.x + this.width / 2 >= this.canvas.width) {
            this.speed = 0;
            return;
        }
        const frameScale = deltatime / FRAME_DURATION;
        if (this.speed < this.maxSpeed) {
            this.speed = Math.min(this.maxSpeed, this.speed + frameScale);
        }
    }

    // ---------- Expresiones (delegadas a la persona) ----------
    showCaughtImage(duration = 450) {
        this.person.showCaught(duration);
    }

    showPenaltyImage(duration = 1000) {
        this.person.showPenalty(duration);
    }

    resize(canvas) {
        this.canvas = canvas;
        this.person.resize(canvas);
        this.trail.resize(canvas);
        this.updateLayout();
        this.x = this.person.x;
        this.updateTrail(0, true);
    }

    // ---------- Update / Draw ----------
    update(deltatime) {
        this.person.update(deltatime);

        if (deltatime == 0) { return; }

        this.x += this.speed * (deltatime / FRAME_DURATION);

        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
            this.speed = 0;
        }

        if (this.x + this.width / 2 > this.canvas.width) {
            this.x = this.canvas.width - this.width / 2;
            this.speed = 0;
        }

        this.updateTrail(deltatime);
    }

    draw(ctx) {
        this.person.draw(ctx);
        this.trail.draw(ctx);
        super.draw(ctx);
    }
}
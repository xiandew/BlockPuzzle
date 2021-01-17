export default class Sprite {
    constructor(img, x = 0, y = 0, width = 0, height = 0) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height ? height : img.height / img.width * width;

        this.startX = this.x - this.width / 2;
        this.startY = this.y - this.height / 2;
        this.endX = this.x + this.width / 2;
        this.endY = this.y + this.height / 2;
    }

    render(ctx) {
        // draw the image from the center at (x, y)
        ctx.drawImage(
            this.img,
            this.startX,
            this.startY,
            this.width,
            this.height
        );
    }

    renderCrop(ctx, sx, sy, sWidth, sHeight, height = this.height) {
        ctx.drawImage(
            this.img, sx, sy, sWidth, sHeight,
            this.startX,
            this.startY,
            this.width,
            height
        )
    }

    collides(other) {
        return (
            other.startX < this.endX &&
            other.startY < this.endY &&
            other.endX > this.startX &&
            other.endY > this.startY
        );
    }

    isTouched(e, pixelRatio) {
        let x = (e.touches[0] || e.changedTouches[0]).clientX * (pixelRatio || 1);
        let y = (e.touches[0] || e.changedTouches[0]).clientY * (pixelRatio || 1);
        return (
            x >= this.startX &&
            y >= this.startY &&
            x <= this.endX &&
            y <= this.endY
        );
    }
}

import Scene from "./Scene";
import Block from "./MainScene/Block";

export default class MainScene extends Scene {
    constructor() {
        super("MainScene");
        this.tilePadding = 3;
    }

    preload() {
        this.load.image("tile", "assets/images/tile.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        let board = this.physics.add.staticGroup();
        let boardMargin = 0.1 * this.cameras.main.width;
        this.tileSize = (this.cameras.main.width - 2 * boardMargin) * 0.1;
        let startX = this.cameras.main.centerX - 4.5 * this.tileSize;
        let startY = this.cameras.main.centerY - 4.5 * this.tileSize;
        for (let i = 0; i < 100; i++) {
            let tile = board.create(
                startX + (i % 10) * this.tileSize,
                startY + Math.floor(i / 10) * this.tileSize,
                "tile"
            );
            tile.displayWidth = tile.displayHeight = this.tileSize - this.tilePadding;
            tile.setTint(0xe5e5e5);
        }

        [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => [
            this.cameras.main.centerX + 2.5 * x * this.tileSize,
            this.cameras.main.centerY + 7.5 * y * this.tileSize
        ]).forEach((p) => new Block(p, this));
    }
}
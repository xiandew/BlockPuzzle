import Scene from "./Scene";

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

        let scoreBoardHeight = 0.15 * this.cameras.main.height;

        let board = this.physics.add.staticGroup();
        let boardMargin = 0.08 * this.cameras.main.width;
        let tileSize = (this.cameras.main.width - 2 * boardMargin) * 0.1;
        let startX = boardMargin + 0.5 * tileSize;
        let startY = (this.cameras.main.height - 10 * tileSize) * 0.5 + 0.5 * tileSize;
        for (let i = 0; i < 100; i++) {
            let tile = board.create(startX + (i % 10) * tileSize, startY + Math.floor(i / 10) * tileSize, "tile");
            tile.displayWidth = tile.displayHeight = tileSize - this.tilePadding;
            tile.setTint(0xe5e5e5);
        }
    }
}
import Phaser from "../../libs/phaser-full.min";
import GameGlobal from "../../data/GameGlobal";

export default class Board extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene) {
        super(scene.physics.world, scene);

        let nRows = 10, nCols = 10;
        this.margin = 0.1 * GameGlobal.width;
        this.centre = {
            x: GameGlobal.centerX,
            y: GameGlobal.centerY
        }
        this.gridSize = (GameGlobal.width - 2 * this.margin) / nCols;
        this.tileSize = this.gridSize - 3;
        let startX = this.centre.x + (-nCols * 0.5 + 0.5) * this.gridSize;
        let startY = this.centre.y + (-nRows * 0.5 + 0.5) * this.gridSize;
        this.tiles = [];
        for (let i = 0; i < nRows; i++) {
            this.tiles.push([]);
            for (let j = 0; j < nCols; j++) {
                let tile = scene.add.image(
                    startX + i * this.gridSize,
                    startY + j * this.gridSize,
                    "tile"
                );
                tile.indexRepr = [i, j];
                tile.displayWidth = tile.displayHeight = this.tileSize;
                tile.setTint(0xe5e5e5);
                this.add(tile);
                this.tiles[i].push(tile);
            }
        }
    }
}
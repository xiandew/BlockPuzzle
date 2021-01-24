import Phaser from "../../libs/phaser-full.min";

export default class Tile extends Phaser.GameObjects.Image {
    constructor(scene, x, y, indexRepr) {
        super(scene, x, y, "tile");

        this.displayWidth = this.displayHeight = Tile.size;
        this.indexRepr = indexRepr;
        this.setTint(0xe5e5e5);

        scene.add.existing(this);
    }
}
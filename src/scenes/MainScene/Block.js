import Tile from "./Tile";
import { colors } from "./Data";

export default class Block extends Tile {
    constructor(scene, x, y, indexRepr, colorIndex) {
        super(scene, x, y, indexRepr);
        this.setColor(colorIndex);
    }

    setColor(colorIndex) {
        this.colorIndex = colorIndex;
        this.setTint(colors[colorIndex]);
    }
}
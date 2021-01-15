import Phaser from "../libs/phaser-full.min";
import Audio from "../utils/Audio";

export default class Scene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.audio = Audio.getInstance();
    }

    autoDisplayHeight(image) {
        return image.height / image.width * image.displayWidth;
    }
}
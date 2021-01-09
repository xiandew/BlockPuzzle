import Phaser from "../libs/phaser-full.min";

export default class Scene extends Phaser.Scene {
    constructor(config){
        super(config);
    }

    autoDisplayHeight(image) {
        return image.height / image.width * image.displayWidth;
    }
}
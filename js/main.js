import Phaser from "./libs/phaser-full.min";
import HomeScene from "./scenes/HomeScene";
import MainScene from "./scenes/MainScene";

export default class Main extends Phaser.Game {

    constructor() {
        let { pixelRatio } = wx.getSystemInfoSync();
        super({
            type: Phaser.WEBGL,
            canvas: canvas,
            width: 320 * pixelRatio,
            height: 568 * pixelRatio,
            physics: {
                default: "arcade",
                arcade: {
                    debug: true
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            input: {
                touch: true
            },
            scene: MainScene,
        });
    }
}

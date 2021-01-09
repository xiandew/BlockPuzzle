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
            backgroundColor: 0xffffff,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            input: {
                touch: true
            },
            scene: [HomeScene, MainScene],
        });
    }
}

wx.showShareMenu({
    withShareTicket: true,
});

wx.onShareAppMessage(() => {
    return {
        title: "方块拼图，简单的快乐",
        imageUrl: "assets/images/share.jpg"
    }
});

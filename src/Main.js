import Phaser from "./libs/phaser-full.min";
import HomeScene from "./scenes/HomeScene";
import MainScene from "./scenes/MainScene";
import GameGlobal from "./data/GameGlobal";

export default class Main extends Phaser.Game {

    constructor() {
        let { screenWidth, screenHeight, pixelRatio } = wx.getSystemInfoSync();
        super({
            type: Phaser.WEBGL,
            canvas: canvas,
            width: screenWidth * pixelRatio,
            height: screenHeight * pixelRatio,
            backgroundColor: 0xffffff,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false
                }
            },
            input: {
                touch: true
            },
            scene: [HomeScene, MainScene],
        });

        if (this.config.height > this.config.width) {
            GameGlobal.width = this.config.width;
            GameGlobal.height = this.config.width / 320 * 568;
        } else {
            GameGlobal.height = this.config.height;
            GameGlobal.width = this.config.height / 568 * 320;
        }
        GameGlobal.centerX = this.config.width * 0.5;
        GameGlobal.centerY = this.config.height * 0.5;
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

import Phaser from "./libs/phaser-full.min";
import HomeScene from "./scenes/HomeScene";
import MainScene from "./scenes/MainScene";
import GameGlobal from "./data/GameGlobal";
import RankScene from "./scenes/RankScene";

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
            scene: [HomeScene, MainScene, RankScene],
        });

        const aspectRatio = 568 / 320;
        if (this.config.height / this.config.width > aspectRatio) {
            GameGlobal.width = this.config.width;
            GameGlobal.height = this.config.width * aspectRatio;
        } else {
            GameGlobal.height = this.config.height;
            GameGlobal.width = this.config.height / aspectRatio;
        }
        GameGlobal.centerX = this.config.width * 0.5;
        GameGlobal.centerY = this.config.height * 0.5;

        let sharedCanvas = wx.getOpenDataContext().canvas;
        sharedCanvas.width = GameGlobal.width;
        sharedCanvas.height = GameGlobal.height;

        wx.getOpenDataContext().postMessage({
            action: "Main"
        });
    }
}

wx.showShareMenu({
    withShareTicket: true,
});

wx.onShareAppMessage(() => {
    return {
        title: "方块拼图，妙趣横生",
        imageUrl: "assets/images/share.jpg"
    }
});

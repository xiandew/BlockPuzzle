import AssetsLoader from "./data/AssetsLoader";
import BitmapText from "./utils/BitmapText.js";
import BitmapFont from "./utils/BitmapFont.js";
import basicSquare7Solid from "./assets/fonts/bitmap/basic-square-7-solid";

class Main {
    constructor() {
        wx.onMessage((msg) => {
            const action = msg.action;
            // if (action === "RenderBestScore") {
            //     if (this.assetsLoaded) {
            //         const { score, x, y } = msg;
            //         this.bitmapText.draw(this.ctx, score, 0.05 * this.canvas.width, x, y);
            //     }
            // }

            if (action === "GameEnded") {
                const score = msg.score;
                const now = new Date();

                wx.setUserCloudStorage({
                    KVDataList: [{
                        key: "record",
                        value: JSON.stringify({
                            wxgame: {
                                score: score,
                                update_time: now.getTime()
                            }
                        })
                    }]
                });
            }
        });

        AssetsLoader.getInstance().onLoaded((assets) => {
            this.assetsLoaded = true;

            this.canvas = wx.getSharedCanvas();
            this.ctx = this.canvas.getContext("2d");

            this.bitmapText = new BitmapText(new BitmapFont(assets.get("basicSquare7Solid"), basicSquare7Solid));
        });
    }
}

new Main();
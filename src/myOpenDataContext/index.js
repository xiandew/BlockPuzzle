import AssetsLoader from "./data/AssetsLoader";
import BitmapText from "./utils/BitmapText.js";
import BitmapFont from "./utils/BitmapFont.js";
import basicSquare7Solid from "./assets/fonts/bitmap/basic-square-7-solid";

class Main {
    constructor() {
        wx.onMessage((msg) => {
            const action = msg.action;
            // if (action === "RenderBestRecord") {
            //     if (this.assetsLoaded) {
            //         const { score, x, y } = msg;
            //         this.bitmapText.draw(this.ctx, score, 0.05 * this.canvas.width, x, y);
            //     }
            // }

            if (action === "UpdateBestRecord") {
                const now = new Date();

                wx.setUserCloudStorage({
                    KVDataList: [{
                        key: "bestRecord",
                        value: JSON.stringify({
                            wxgame: {
                                score: msg.bestRecord,
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
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(0, 0, 100, 100);

            this.bitmapText = new BitmapText(new BitmapFont(assets.get("basicSquare7Solid"), basicSquare7Solid));
        });
    }
}

new Main();
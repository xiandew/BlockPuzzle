import Scene from "./Scene";

export default class RankScene extends Scene {
    constructor() {
        super("RankScene");
    }

    preload() { }

    create() {
        // if (!this.textures.exists("sharedCanvas")) this.textures.addCanvas("sharedCanvas", wx.getOpenDataContext().canvas);
        // this.sharedCanvas = this.add.image(
        //     GameGlobal.centerX,
        //     GameGlobal.centerY,
        //     "sharedCanvas"
        // );
        // this.sharedCanvas.displayWidth = GameGlobal.width;
        // this.sharedCanvas.displayHeight = this.autoDisplayHeight(this.sharedCanvas);
    }

    update() { }
}
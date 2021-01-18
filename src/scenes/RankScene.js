import Scene from "./Scene";
import GameGlobal from "../data/GameGlobal";

export default class RankScene extends Scene {
    constructor() {
        super("RankScene");
    }

    init(data) {
        this.from = data.from;
        this.currentScore = data.currentScore;
    }

    preload() {
        this.load.image("return-btn", "assets/images/return-btn.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        let headerBg = wx.createCanvas();
        headerBg.width = GameGlobal.width;
        headerBg.height = GameGlobal.centerY - 0.22 * GameGlobal.height;
        let headerBgCtx = headerBg.getContext("2d");
        headerBgCtx.fillStyle = "#00c777";
        headerBgCtx.fillRect(0, 0, headerBg.width, headerBg.height);

        headerBgCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
        headerBgCtx.beginPath();
        let yIntercept = GameGlobal.centerY - 0.332 * GameGlobal.height;
        headerBgCtx.moveTo(0, yIntercept);
        headerBgCtx.quadraticCurveTo(
            headerBg.width * 0.5,
            GameGlobal.centerY - 0.2816 * GameGlobal.height,
            headerBg.width,
            yIntercept
        );
        headerBgCtx.lineTo(headerBg.width, headerBg.height);
        headerBgCtx.lineTo(0, headerBg.height);
        headerBgCtx.closePath();
        headerBgCtx.fill();
        if (!this.textures.exists("lb-header-bg")) this.textures.addCanvas("lb-header-bg", headerBg);
        this.add.image(
            headerBg.width * 0.5,
            headerBg.height * 0.5,
            "lb-header-bg"
        );

        let headerFontSize = 0.03 * GameGlobal.height;
        let header = this.add.text(
            GameGlobal.centerX,
            GameGlobal.centerY - 0.45 * GameGlobal.height,
            "排行榜",
            { font: headerFontSize + "px Arial", fill: "#fff" }
        ).setOrigin(0.5);

        let returnBtn = this.add.image(
            GameGlobal.centerX - 0.42 * GameGlobal.width,
            header.y,
            "return-btn"
        ).setInteractive();
        returnBtn.displayWidth = 0.045 * GameGlobal.width;
        returnBtn.displayHeight = this.autoDisplayHeight(returnBtn);
        returnBtn.on("pointerup", () => {
            if (this.scene.isPaused(this.from)) {
                this.scene.stop();
                this.scene.resume(this.from);
                this.scene.bringToTop(this.from);
            } else {
                this.scene.start(this.from);
            }
        });
        this.audio.addNavTap(returnBtn);

        let tabFontSize = headerFontSize * 0.85;
        let tabThisWeek = this.add.text(
            GameGlobal.centerX - 0.2 * GameGlobal.width,
            GameGlobal.centerY - 0.38 * GameGlobal.height,
            "本周",
            { font: tabFontSize + "px Arial", fill: "#fff" }
        ).setOrigin(0.5).setInteractive();
        tabThisWeek.tab = "thisWeek";

        let tabBestRecord = this.add.text(
            GameGlobal.centerX + 0.2 * GameGlobal.width,
            GameGlobal.centerY - 0.38 * GameGlobal.height,
            "最高分",
            { font: tabFontSize + "px Arial", fill: "#fff" }
        ).setOrigin(0.5).setInteractive();
        tabBestRecord.tab = "bestRecord";

        let graphics = this.add.graphics();
        let tabBarHeight = tabFontSize * 0.25;
        let tabBarWidth = tabFontSize * 5;
        graphics.lineStyle(tabBarHeight, 0xffffff, 1);
        graphics.lineBetween(0, 0, tabBarWidth, 0);
        graphics.generateTexture("tab-bar", tabBarWidth, tabBarHeight);
        graphics.destroy();
        let tabBar = this.add.sprite(tabThisWeek.x, tabThisWeek.y + tabFontSize, "tab-bar").setOrigin(0.5);

        [tabThisWeek, tabBestRecord].forEach((tab) => tab.on("pointerup", function () {
            wx.getOpenDataContext().postMessage({
                action: "RankScene",
                tab: this.tab
            });
            this.scene.tweens.add({
                targets: tabBar,
                x: this.x,
                duration: 400,
                ease: "Power2"
            });
        }));

        wx.getOpenDataContext().postMessage({
            action: "RankScene",
            tab: tabThisWeek.tab,
            score: this.currentScore
        });

        if (!this.textures.exists("shared-canvas")) this.textures.addCanvas("shared-canvas", wx.getOpenDataContext().canvas);
        this.sharedCanvas = this.add.image(
            GameGlobal.centerX,
            GameGlobal.centerY,
            "shared-canvas"
        );
        this.sharedCanvas.displayWidth = GameGlobal.width;
        this.sharedCanvas.displayHeight = this.autoDisplayHeight(this.sharedCanvas);

        this.triggerTimer = this.time.addEvent({
            callback: () => this.sharedCanvas.frame.texture.refresh(),
            callbackScope: this,
            delay: 300,
            loop: true
        });
    }
}
import Scene from "./Scene";
import GameGlobal from "../data/GameGlobal";

export default class HomeScene extends Scene {
    constructor() {
        super("HomeScene");
    }

    init(data) {
        this.fromMainScene = data.fromMainScene;
    }

    preload() {
        this.load.image("logo", "assets/images/logo.png");
        this.load.image("start-btn", "assets/images/start-btn.png");
        this.load.image("continue-btn", "assets/images/continue-btn.png");
        this.load.image("restart-btn", "assets/images/restart-btn.png");
        this.load.image("view-leaderboard-icon-btn", "assets/images/view-leaderboard-icon-btn.png");

        this.load.spritesheet("sound-sheet", "assets/images/sound-sheet.png", { frameWidth: 60.5, frameHeight: 60 });
        this.load.spritesheet("music-sheet", "assets/images/music-sheet.png", { frameWidth: 59.5, frameHeight: 60 });
    }

    create() {
        this.cameras.main.setBackgroundColor(0xeadeda);

        let logo = this.add.image(
            GameGlobal.centerX,
            GameGlobal.centerY - GameGlobal.height * 0.3,
            "logo"
        );
        logo.displayWidth = GameGlobal.width;
        logo.displayHeight = this.autoDisplayHeight(logo);

        let buttons = [];

        if (this.fromMainScene) {
            let continueBtn = this.add.image(
                GameGlobal.centerX,
                GameGlobal.centerY - GameGlobal.height * 0.1,
                "continue-btn"
            ).setInteractive();
            continueBtn.displayWidth = 0.6 * GameGlobal.width;
            continueBtn.displayHeight = this.autoDisplayHeight(continueBtn);
            continueBtn.on("pointerup", () => {
                this.scene.stop();
                this.scene.resume("MainScene");
                this.scene.bringToTop("MainScene");
            });
            buttons.push(continueBtn);

            let restartBtn = this.add.image(
                GameGlobal.centerX,
                GameGlobal.centerY + GameGlobal.height * 0.05,
                "restart-btn"
            ).setInteractive();
            restartBtn.displayWidth = 0.6 * GameGlobal.width;
            restartBtn.displayHeight = this.autoDisplayHeight(restartBtn);
            restartBtn.on("pointerup", () => {
                this.scene.start("MainScene");
            });
            buttons.push(restartBtn);
        } else {
            let startBtn = this.add.image(
                GameGlobal.centerX,
                GameGlobal.centerY,
                "start-btn"
            ).setInteractive();
            startBtn.displayWidth = 0.6 * GameGlobal.width;
            startBtn.displayHeight = this.autoDisplayHeight(startBtn);
            startBtn.on("pointerup", () => {
                this.scene.start("MainScene");
            });
            buttons.push(startBtn);
        }

        let soundBtn = this.add.sprite(
            GameGlobal.centerX - GameGlobal.width * 0.15,
            GameGlobal.centerY + GameGlobal.height * 0.25,
            "sound-sheet", this.audio.bgmOn ? 0 : 1
        ).setInteractive();
        soundBtn.displayWidth = 0.09 * GameGlobal.width;
        soundBtn.displayHeight = this.autoDisplayHeight(soundBtn);
        let _this = this;
        soundBtn.on("pointerup", function () {
            if (_this.audio.bgmOn) {
                this.setFrame(1);
                _this.audio.stopBGM();
            } else {
                this.setFrame(0);
                _this.audio.playBGM();
            }
        });
        buttons.push(soundBtn);

        let musicBtn = this.add.sprite(
            GameGlobal.centerX,
            GameGlobal.centerY + GameGlobal.height * 0.25,
            "music-sheet", this.audio.musicOn ? 0 : 1
        ).setInteractive();
        musicBtn.displayWidth = 0.09 * GameGlobal.width;
        musicBtn.displayHeight = this.autoDisplayHeight(musicBtn);
        musicBtn.on("pointerdown", function () {
            if (_this.audio.musicOn) {
                _this.audio.musicOn = false;
                this.setFrame(1);
            } else {
                _this.audio.musicOn = true;
                this.setFrame(0);
            }
        });
        buttons.push(musicBtn);

        let viewLbIconBtn = this.add.image(
            GameGlobal.centerX + GameGlobal.width * 0.15,
            GameGlobal.centerY + GameGlobal.height * 0.25,
            "view-leaderboard-icon-btn"
        ).setInteractive();
        viewLbIconBtn.displayWidth = 0.09 * GameGlobal.width;
        viewLbIconBtn.displayHeight = this.autoDisplayHeight(viewLbIconBtn);
        viewLbIconBtn.on("pointerup", () => {
            this.scene.pause();
            this.scene.launch("RankScene", { from: this.scene.key });
            this.scene.bringToTop("RankScene");
        });
        buttons.push(viewLbIconBtn);

        buttons.forEach((button) => {
            button.on("pointerdown", function () {
                this.setTint(0xd3d3d3);
            });
            button.on("pointerup", function () {
                this.clearTint();
            });
            this.audio.addNavTap(button);
        });

        this.events.on("shutdown", () => {
            wx.setStorage({
                key: "setting",
                data: JSON.stringify({
                    bgmOn: this.audio.bgmOn,
                    musicOn: this.audio.musicOn
                })
            });

            this.events.off("shutdown");
        });
    }
}
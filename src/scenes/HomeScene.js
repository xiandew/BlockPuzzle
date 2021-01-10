import Audio from "../utils/Audio";
import Scene from "./Scene";
import GameGlobal from "../data/GameGlobal";

export default class HomeScene extends Scene {
    constructor() {
        super("HomeScene");
        this.audio = Audio.getInstance();
    }

    init(data) {
        this.fromMainScene = data.fromMainScene;
    }

    preload() {
        this.load.image("logo", "assets/images/logo.png");
        this.load.image("start-btn", "assets/images/start-btn.png");
        this.load.image("continue-btn", "assets/images/continue-btn.png");
        this.load.image("restart-btn", "assets/images/restart-btn.png");

        this.load.spritesheet("sound-sheet", "assets/images/sound-sheet.png", { frameWidth: 140, frameHeight: 132 });
        this.load.spritesheet("music-sheet", "assets/images/music-sheet.png", { frameWidth: 130, frameHeight: 122 });
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
            continueBtn.on("pointerout", () => {
                this.scene.stop();
                this.scene.setVisible(true, "MainScene");
            });
            buttons.push(continueBtn);

            let restartBtn = this.add.image(
                GameGlobal.centerX,
                GameGlobal.centerY + GameGlobal.height * 0.05,
                "restart-btn"
            ).setInteractive();
            restartBtn.displayWidth = 0.6 * GameGlobal.width;
            restartBtn.displayHeight = this.autoDisplayHeight(restartBtn);
            restartBtn.on("pointerout", () => {
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
            startBtn.on("pointerout", () => {
                this.scene.start("MainScene");
            });
            buttons.push(startBtn);
        }

        let soundBtn = this.add.sprite(
            GameGlobal.centerX - GameGlobal.width * 0.1,
            GameGlobal.centerY + GameGlobal.height * 0.25,
            "sound-sheet", this.audio.bgmOn ? 0 : 1
        ).setInteractive();
        soundBtn.displayWidth = 0.09 * GameGlobal.width;
        soundBtn.displayHeight = this.autoDisplayHeight(soundBtn);
        let _this = this;
        soundBtn.on("pointerout", function () {
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
            GameGlobal.centerX + GameGlobal.width * 0.1,
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

        buttons.forEach((button) => {
            button.on("pointerdown", function () {
                this.setTint(0xd3d3d3);
            });
            button.on("pointerout", function () {
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
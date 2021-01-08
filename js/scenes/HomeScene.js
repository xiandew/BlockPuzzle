import Audio from "./Audio";
import Scene from "./Scene";

export default class HomeScene extends Scene {
    constructor() {
        super("HomeScene");
        this.audio = Audio.getInstance();
    }

    init(data) {
        this.fromMainScene = data.fromMainScene;
    }

    preload() {
        [
            ["logo", "assets/images/logo.png"],
            ["start-btn", "assets/images/start-btn.png"]
        ].forEach(([key, url]) => {
            this.load.image(key, url);
        });

        this.load.spritesheet("sound-sheet", "assets/images/sound-sheet.png", { frameWidth: 140, frameHeight: 132 });
        this.load.spritesheet("music-sheet", "assets/images/music-sheet.png", { frameWidth: 130, frameHeight: 122 });
    }

    create() {
        this.cameras.main.setBackgroundColor(0xeadeda);

        let logo = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.2,
            "logo"
        );
        logo.displayWidth = this.cameras.main.width;
        logo.displayHeight = this.autoDisplayHeight(logo);

        let buttons = [];
        let startBtn = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "start-btn"
        ).setInteractive();
        startBtn.displayWidth = 0.6 * this.cameras.main.width;
        startBtn.displayHeight = this.autoDisplayHeight(startBtn);
        startBtn.on("pointerout", () => {
            if (this.fromMainScene) {
                this.scene.stop();
                this.scene.setVisible(true, "MainScene");
            } else {
                this.scene.start("MainScene");
            }
        });
        buttons.push(startBtn);

        let soundBtn = this.add.sprite(
            0.4 * this.cameras.main.width,
            0.75 * this.cameras.main.height,
            "sound-sheet", this.audio.bgmOn ? 0 : 1
        ).setInteractive();
        soundBtn.displayWidth = 0.15 * startBtn.displayWidth;
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
            0.6 * this.cameras.main.width,
            0.75 * this.cameras.main.height,
            "music-sheet", this.audio.musicOn ? 0 : 1
        ).setInteractive();
        musicBtn.displayWidth = 0.15 * startBtn.displayWidth;
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
    }
}
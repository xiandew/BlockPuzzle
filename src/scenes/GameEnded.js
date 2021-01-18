import Scene from "./Scene";
import GameGlobal from "../data/GameGlobal";

export default class GameEnded extends Scene {
    constructor() {
        super("GameEnded");
    }

    init(data) {
        this.currentScore = data.currentScore;
    }

    preload() {
        this.load.image("gameover-text", "assets/images/gameover-text.png");
        this.load.image("undo-text-btn", "assets/images/undo-text-btn.png");
        this.load.image("view-leaderboard-btn", "assets/images/view-leaderboard-btn.png");
    }

    create() {
        this.createGameOverModal();
        this.showGameOverModal();
    }

    showGameOverModal() {
        if (!this.scene.get("MainScene").undoBtn.chess) {
            this.undoTextBtn.setVisible(false);
            this.restartBtn.setPosition(0, -0.2 * this.gameOverModal.height);
            this.viewLeaderboardBtn.setPosition(0, 0 * this.gameOverModal.height);
        }

        this.tweens.add({
            targets: this.gameOverModal,
            x: this.gameOverModal.x,
            y: GameGlobal.centerY,
            alpha: 1,
            duration: 400,
            ease: "Power2"
        });
    }

    hideGameOverModal() {
        this.tweens.add({
            targets: this.gameOverModal,
            x: this.gameOverModal.x,
            y: 0,
            alpha: 0,
            duration: 400,
            ease: "Power2"
        });
    }

    createGameOverModal() {
        this.gameOverModal = this.add.container(GameGlobal.centerX, 0);
        this.gameOverModal.setDepth(Infinity);
        this.gameOverModal.alpha = 0;
        this.gameOverModal.setSize(0.9 * GameGlobal.width, 0.7 * GameGlobal.height);

        let graphics = this.add.graphics();
        graphics.fillStyle(0xeadeda, 1);
        graphics.fillRoundedRect(
            GameGlobal.centerX - this.gameOverModal.width * 0.5,
            GameGlobal.centerY - this.gameOverModal.height * 0.5,
            this.gameOverModal.width,
            this.gameOverModal.height,
            this.gameOverModal.width * 0.05
        );
        graphics.generateTexture("gameOverModalBackground");
        graphics.destroy();
        let gameOverModalBackground = this.add.sprite(0, 0, "gameOverModalBackground");
        let gameOverText = this.add.image(0, -0.42 * this.gameOverModal.height, "gameover-text");
        gameOverText.displayWidth = 0.9 * this.gameOverModal.width;
        gameOverText.displayHeight = this.autoDisplayHeight(gameOverText);
        gameOverText.setTint(0xff6f69);

        this.undoTextBtn = this.add.image(0, -0.2 * this.gameOverModal.height, "undo-text-btn").setInteractive();
        this.undoTextBtn.displayWidth = 0.6 * GameGlobal.width;
        this.undoTextBtn.displayHeight = this.autoDisplayHeight(this.undoTextBtn);
        this.undoTextBtn.on("pointerup", () => {
            this.hideGameOverModal();
            this.scene.stop();
            this.scene.resume("MainScene");
            this.scene.get("MainScene").undoBtn.emit("pointerup");
        });
        this.audio.addNavTap(this.undoTextBtn);

        this.restartBtn = this.add.image(0, 0, "restart-btn").setInteractive();
        this.restartBtn.displayWidth = 0.6 * GameGlobal.width;
        this.restartBtn.displayHeight = this.autoDisplayHeight(this.restartBtn);
        this.restartBtn.on("pointerup", () => this.scene.start("MainScene"));
        this.audio.addNavTap(this.restartBtn);

        this.viewLeaderboardBtn = this.add.image(0, 0.2 * this.gameOverModal.height, "view-leaderboard-btn").setInteractive();
        this.viewLeaderboardBtn.displayWidth = 0.6 * GameGlobal.width;
        this.viewLeaderboardBtn.displayHeight = this.autoDisplayHeight(this.viewLeaderboardBtn);
        this.viewLeaderboardBtn.on("pointerup", () => {
            this.scene.pause();
            this.scene.launch("RankScene", {
                from: this.scene.key,
                currentScore: this.currentScore
            });
            this.scene.bringToTop("RankScene");
        });
        this.audio.addNavTap(this.viewLeaderboardBtn);

        this.gameOverModal.add(gameOverModalBackground);
        this.gameOverModal.add(gameOverText);
        this.gameOverModal.add(this.undoTextBtn);
        this.gameOverModal.add(this.restartBtn);
        this.gameOverModal.add(this.viewLeaderboardBtn);
    }
}
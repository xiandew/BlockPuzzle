import Scene from "./Scene";
import Chess from "./MainScene/Chess";
import Board from "./MainScene/Board";
import Audio from "../utils/Audio";
import GameGlobal from "../data/GameGlobal";

export default class MainScene extends Scene {
    constructor() {
        super("MainScene");
        this.audio = Audio.getInstance();
    }

    preload() {
        this.load.image("tile", "assets/images/tile.png");
        this.load.image("undo-btn", "assets/images/undo-btn.png");
        this.load.image("home-btn", "assets/images/home-btn.png");
        [...Array(8).keys()].forEach(i => {
            this.load.image(`particles${i}`, `assets/images/particles${i}.png`);
        });

        this.load.image("best-score", "assets/images/best-score.png");
        this.load.image("gameover-text", "assets/images/gameover-text.png");
        this.load.image("undo-text-btn", "assets/images/undo-text-btn.png");
        this.load.bitmapFont(
            "basic-square-7-solid",
            "assets/fonts/bitmap/basic-square-7-solid_0.png",
            "assets/fonts/bitmap/basic-square-7-solid.xml"
        );
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        this.board = new Board(this);
        this.loadChesses();

        this.undoBtn = this.add.image(
            GameGlobal.centerX - GameGlobal.width * 0.4,
            GameGlobal.centerY - GameGlobal.height * 0.45,
            "undo-btn"
        ).setInteractive();
        this.undoBtn.displayWidth = 0.06 * GameGlobal.width;
        this.undoBtn.displayHeight = this.autoDisplayHeight(this.undoBtn);
        this.undoBtn.setTint(0x00c777);
        this.undoBtn.alpha = 0;
        let _this = this;
        this.undoBtn.on("pointerout", function () {
            if (this.alpha == 1) {
                if (!this.chess) {
                    return;
                }

                if (_this.chesses.length == Chess.directions.length) {
                    _this.chesses.forEach((chess) => chess.exit());
                }

                this.chess.container.list.forEach((block) => {
                    block.tile.block.destroy();
                    block.tile.block = null;
                });
                this.chess.container.setVisible(true);
                this.chess.moveToOrigin();

                _this.chesses.push(this.chess);
                this.chess = null;
                this.setTint(0xe5e5e5);
            }
        });

        this.undoBtn.on("placechess", function (chess) {
            if (this.alpha != 1) {
                _this.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: 300,
                    ease: "Power2"
                });
            }

            if (this.chess) {
                this.chess.container.destroy();
            }

            if (!chess) {
                this.setTint(0xe5e5e5);
            } else {
                this.setTint(0x00c777);
            }

            this.chess = chess;

            if (!_this.chesses.length) {
                _this.loadChesses();
            }

            if (_this.chesses.length == Chess.directions.length) {
                _this.chesses.forEach((chess) => chess.enter());
            }
        });

        this.events.on("placechess", (chess) => {
            this.chesses.splice(this.chesses.indexOf(chess), 1);

            const matches = this.board.tiles.reduce((matches, row, i) => {
                return matches
                    .concat(match(row) || [])
                    .concat(match(this.board.tiles.map((row) => row[i])) || []);

                function match(row) {
                    if (row.every((tile) => tile.block)) {
                        return [row];
                    }
                    return null;
                }
            }, []);
            matches.forEach((match) => this.score(match));

            if (matches.length) {
                this.undoBtn.emit("placechess");
                chess.container.destroy();
            } else {
                this.undoBtn.emit("placechess", chess);
                this.tryGameOver();
            }
        });
        this.events.on("shutdown", () => {
            this.events.off("placechess");
            this.events.off("shutdown");
        });

        let homeBtn = this.add.image(
            GameGlobal.centerX - GameGlobal.width * 0.4,
            GameGlobal.centerY + GameGlobal.height * 0.45,
            "home-btn"
        ).setInteractive();
        homeBtn.displayWidth = 0.06 * GameGlobal.width;
        homeBtn.displayHeight = this.autoDisplayHeight(homeBtn);
        homeBtn.on("pointerout", () => {
            this.scene.setVisible(false);
            this.scene.launch("HomeScene", { fromMainScene: true });
        });

        this.audio.addNavTap(homeBtn);

        this.bestScoreIcon = this.add.image(
            GameGlobal.centerX,
            GameGlobal.centerY - GameGlobal.height * 0.45,
            "best-score"
        );
        this.bestScoreIcon.displayWidth = this.undoBtn.displayWidth;
        this.bestScoreIcon.displayHeight = this.autoDisplayHeight(this.bestScoreIcon);

        this.currentScore = this.add.bitmapText(
            GameGlobal.centerX - this.bestScoreIcon.displayWidth,
            GameGlobal.centerY - GameGlobal.height * 0.45,
            "basic-square-7-solid",
            "0", 0.05 * GameGlobal.width
        ).setOrigin(1, 0.5);
        this.currentScore.value = 0;

        let bestRecord = 0;
        try {
            let data = wx.getStorageSync("data")
            if (data) {
                data = JSON.parse(data);
                if (data.bestRecord) bestRecord = data.bestRecord;
            }
        } catch (e) {
            console.error(e);
        }

        this.bestScore = this.add.bitmapText(
            GameGlobal.centerX + this.bestScoreIcon.displayWidth,
            GameGlobal.centerY - GameGlobal.height * 0.45,
            "basic-square-7-solid",
            bestRecord, 0.05 * GameGlobal.width
        ).setOrigin(0, 0.5);
        this.bestScore.value = bestRecord;

        // setup the offscreen canvas for the best score
        // let sharedCanvas = wx.getOpenDataContext().canvas;
        // let sharedCanvas.width = GameGlobal.width;
        // let sharedCanvas.height = GameGlobal.height;

        // this.textures.addCanvas("sharedCanvas", sharedCanvas);
        // this.sharedCanvas = this.add.image(
        //     GameGlobal.centerX,
        //     GameGlobal.centerY,
        //     "sharedCanvas"
        // );
        // this.sharedCanvas.displayWidth = GameGlobal.width;
        // this.sharedCanvas.displayHeight = this.autoDisplayHeight(this.sharedCanvas);

        this.createGameOverModal();
    }

    update() {
        this.chesses.forEach((chess) => {
            if (chess.container.body.embedded) chess.container.body.touching.none = false;
            var touching = !chess.container.body.touching.none;
            var wasTouching = !chess.container.body.wasTouching.none;

            if (!touching && wasTouching) chess.emit("overlapend", chess);
        });
    }

    loadChesses() {
        this.chesses = Chess.directions.reverse().map(([dx, dy]) => {
            return new Chess(this, dx, dy);
        });

        this.chesses.forEach((chess) => {
            this.physics.add.overlap(chess, this.board, function (block, tile) {
                let d = Math.sqrt(
                    Math.pow(block.parentContainer.x + block.x - tile.x, 2) +
                    Math.pow(block.parentContainer.y + block.y - tile.y, 2)
                );
                if (d < this.board.gridSize * 0.5) {
                    block.parentContainer.setPosition(
                        tile.x - block.x,
                        tile.y - block.y
                    );
                    block.parentContainer.onBoard = true;
                }
            }, function (block, tile) {
                block.tile = tile;
                return block.parentContainer.dragging && !block.parentContainer.onBoard;
            }, this);

            chess.on("overlapend", function (chess) {
                chess.container.onBoard = false;
                chess.container.list.forEach((block) => block.tile = null);
            });

            this.physics.add.overlap(chess.container, this.board);
        });
    }

    score(row) {
        this.audio.playMatch();
        this.currentScore.value += row.length;
        this.currentScore.text = this.currentScore.value.toString();

        if (this.currentScore.value > this.bestScore.value) {
            this.bestScore.value = this.currentScore.value;
            this.bestScore.text = this.currentScore.text;

            wx.setStorage({
                key: "data",
                data: JSON.stringify({
                    bestRecord: this.currentScore.value,
                    lastUpdate: new Date().getTime()
                })
            });

            wx.setUserCloudStorage({
                KVDataList: [{
                    key: "bestRecord",
                    value: JSON.stringify({
                        wxgame: {
                            score: this.currentScore,
                            update_time: new Date().getTime()
                        }
                    })
                }]
            });
        }

        row.map((tile) => tile.block).forEach((block, i) => {
            if (!block) {
                return;
            }

            this.add.particles(`particles${block.colorIndex}`, null, {
                x: block.x,
                y: block.y,
                angle: { start: 0, end: 360, steps: 12 },
                speed: { random: [10, 150] },
                quantity: 2,
                alpha: { start: 1, end: 0 },
                maxParticles: 30,
                scale: 0.05
            });

            this.tweens.add({
                targets: block,
                duration: 400,
                displayWidth: { start: block.displayWidth, to: 0 },
                displayHeight: { start: block.displayHeight, to: 0 },
                ease: "Power2",
                onComplete: () => {
                    block.destroy();
                    row[i].block = null;

                    if (row.every((tile) => !tile.block)) {
                        this.tryGameOver();
                    }
                }
            });
        });
    }

    tryGameOver() {
        if (!this.chesses.some((chess) => {
            return this.board.getChildren().some((tile) => {
                return chess.container.list.every((block) => {
                    const r = this.board.tiles[tile.indexRepr[0] + block.indexRepr[0]];
                    const t = r && r[tile.indexRepr[1] + block.indexRepr[1]];
                    return t && !t.block;
                });
            });
        })) {
            this.chesses.forEach((chess) => {
                chess.shake(() => {
                    chess.shaked = true;
                    if (this.chesses.every((chess) => chess.shaked)) {
                        this.showGameOverModal();
                    }
                });
            });
        }
    }

    showGameOverModal() {
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
            (GameGlobal.width - this.gameOverModal.width) * 0.5,
            (GameGlobal.height - this.gameOverModal.height) * 0.5,
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

        let undoTextBtn = this.add.image(0, -0.2 * this.gameOverModal.height, "undo-text-btn").setInteractive();
        undoTextBtn.displayWidth = 0.6 * GameGlobal.width;
        undoTextBtn.displayHeight = this.autoDisplayHeight(undoTextBtn);
        undoTextBtn.on("pointerout", () => {
            this.hideGameOverModal();
            this.undoBtn.emit("pointerout");
        });
        this.audio.addNavTap(undoTextBtn);

        let restartBtn = this.add.image(0, 0, "restart-btn").setInteractive();
        restartBtn.displayWidth = 0.6 * GameGlobal.width;
        restartBtn.displayHeight = this.autoDisplayHeight(restartBtn);
        restartBtn.on("pointerout", () => this.scene.start("MainScene"));
        this.audio.addNavTap(restartBtn);

        this.gameOverModal.add(gameOverModalBackground);
        this.gameOverModal.add(gameOverText);
        this.gameOverModal.add(undoTextBtn);
        this.gameOverModal.add(restartBtn);
    }
}
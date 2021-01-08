import Scene from "./Scene";
import Chess from "./MainScene/Chess";
import Board from "./MainScene/Board";
import Audio from "./Audio";

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
            this.board.margin,
            this.board.margin,
            "undo-btn"
        ).setInteractive();
        this.undoBtn.displayWidth = 0.06 * this.cameras.main.width;
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

        let homeBtn = this.add.image(
            this.board.margin,
            this.cameras.main.height - this.board.margin,
            "home-btn"
        ).setInteractive();
        homeBtn.displayWidth = 0.06 * this.cameras.main.width;
        homeBtn.displayHeight = this.autoDisplayHeight(homeBtn);
        homeBtn.on("pointerout", () => {
            this.scene.setVisible(false);
            this.scene.launch("HomeScene", { fromMainScene: true });
        });

        this.audio.addNavTap(homeBtn);

        this.bestScoreIcon = this.add.image(
            this.board.centre.x,
            this.board.margin,
            "best-score"
        );
        this.bestScoreIcon.displayWidth = this.undoBtn.displayWidth;
        this.bestScoreIcon.displayHeight = this.autoDisplayHeight(this.bestScoreIcon);

        this.currentScore = this.add.bitmapText(
            this.board.centre.x - this.bestScoreIcon.displayWidth,
            this.board.margin,
            "basic-square-7-solid",
            "0", 0.05 * this.cameras.main.width
        ).setOrigin(1, 0.5);
        this.currentScore.value = 0;

        this.bestScore = this.add.bitmapText(
            this.board.centre.x + this.bestScoreIcon.displayWidth,
            this.board.margin,
            "basic-square-7-solid",
            "0", 0.05 * this.cameras.main.width
        ).setOrigin(0, 0.5);
        this.bestScore.value = 0;
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
                }
            });
        });
    }
}
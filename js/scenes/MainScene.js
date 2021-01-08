import Scene from "./Scene";
import Chess from "./MainScene/Chess";
import Board from "./MainScene/Board";

export default class MainScene extends Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image("tile", "assets/images/tile.png");
        this.load.spritesheet("undo-redo-sheet", "assets/images/undo-redo-sheet.png", { frameWidth: 110, frameHeight: 113 });
        [...Array(8).keys()].forEach(i => {
            this.load.image(`particles${i}`, `assets/images/particles${i}.png`);
        });
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        this.board = new Board(this);
        this.loadChesses();

        this.undoBtn = this.add.sprite(
            this.board.margin,
            this.board.margin,
            "undo-redo-sheet", 0
        ).setInteractive();
        this.undoBtn.displayWidth = 0.06 * this.cameras.main.width;
        this.undoBtn.displayHeight = this.autoDisplayHeight(this.undoBtn);
        this.undoBtn.setTint(0x00c777);
        this.undoBtn.alpha = 0;
        let _this = this;
        this.undoBtn.on("pointerout", function () {
            if (this.alpha == 1) {
                if (!this.frame.name) {
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
                    this.setFrame(1);
                } else {
                    this.setFrame(0);
                }
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

            this.setFrame(0);
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
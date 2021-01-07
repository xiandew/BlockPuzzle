import Scene from "./Scene";
import Chess from "./MainScene/Chess";

export default class MainScene extends Scene {
    constructor() {
        super("MainScene");
        this.tilePadding = 3;
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

        let nRows = 10, nCols = 10;
        let boardMargin = 0.1 * this.cameras.main.width;
        this.boardCentre = {
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY
        }
        this.tileSize = (this.cameras.main.width - 2 * boardMargin) / nCols;
        let startX = this.boardCentre.x + (-nCols * 0.5 + 0.5) * this.tileSize;
        let startY = this.boardCentre.y + (-nRows * 0.5 + 0.5) * this.tileSize;
        this.tiles = this.physics.add.staticGroup();
        this.board = [];
        for (let i = 0; i < nRows; i++) {
            this.board.push([]);
            for (let j = 0; j < nCols; j++) {
                let tile = this.add.image(
                    startX + i * this.tileSize,
                    startY + j * this.tileSize,
                    "tile"
                );
                tile.indexRepr = [i, j];
                tile.displayWidth = tile.displayHeight = this.tileSize - this.tilePadding;
                tile.setTint(0xe5e5e5);
                this.tiles.add(tile);
                this.board[i].push(tile);
            }
        }

        this.loadChesses();

        this.undoBtn = this.add.sprite(
            boardMargin,
            boardMargin,
            "undo-redo-sheet", 0
        ).setInteractive();
        this.undoBtn.displayWidth = 0.06 * this.cameras.main.width;
        this.undoBtn.displayHeight = this.autoDisplayHeight(this.undoBtn);
        this.undoBtn.alpha = 0;
        let _this = this;
        this.undoBtn.on("pointerout", function () {
            if (this.alpha == 1) {

                this.setFrame(1);
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
            this.chess = chess;

            if (!_this.chesses.length) {
                _this.loadChesses();
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
        this.chesses = [[-1, -1], [1, -1], [-1, 1], [1, 1]].reverse().map(([dx, dy]) => {
            return new Chess(this, dx, dy);
        });

        this.chesses.forEach((chess) => {
            this.physics.add.overlap(chess, this.tiles, function (block, tile) {
                let d = Math.sqrt(
                    Math.pow(block.parentContainer.x + block.x - tile.x, 2) +
                    Math.pow(block.parentContainer.y + block.y - tile.y, 2)
                );
                if (d < this.tileSize * 0.5) {
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

            this.physics.add.overlap(chess.container, this.tiles);
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
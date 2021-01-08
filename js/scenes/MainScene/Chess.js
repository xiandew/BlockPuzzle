import Phaser from "../../libs/phaser-full.min";
import UCB from "./utils/UCB";

const patterns = [
    [
        [0, 1, 0],
        [1, 1, 1]
    ], [
        [1, 0, 0],
        [1, 1, 1]
    ], [
        [1, 1, 0],
        [0, 1, 1]
    ], [
        [1, 1],
        [1, 1]
    ], [
        [1, 1, 1]
    ], [
        [1]
    ], [
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
    ], [
        [1, 0],
        [1, 1]
    ], [
        [1, 1]
    ]
].reduce((patterns, pattern) => {
    function rotateRight(matrix) {
        let rotated = [];
        matrix.forEach(function (row, i) {
            row.forEach(function (col, j) {
                rotated[row.length - j - 1] = rotated[row.length - j - 1] || [];
                rotated[row.length - j - 1][i] = col;
            });
        });
        return rotated;
    }

    function toString(matrix) {
        return matrix.map(row => row.join("")).join(",");
    }

    let rotate90 = rotateRight(pattern);
    let rotate180 = rotateRight(rotate90);
    let rotate270 = rotateRight(rotate180);
    [pattern, rotate90, rotate180, rotate270].forEach((pattern) => {
        if (!patterns.map((pattern) => toString(pattern)).includes(toString(pattern))) {
            patterns.push(pattern);
        }
    });

    return patterns;
}, []).map((binRepr) => {
    let indexRepr = [];
    let indexOffset;
    binRepr.forEach((row, i) => {
        row.forEach((col, j) => {
            if (col) {
                if (!indexRepr.length) {
                    indexOffset = [i, j];
                    indexRepr.push([0, 0]);
                } else {
                    indexRepr.push([i - indexOffset[0], j - indexOffset[1]]);
                }
            }
        })
    });
    return {
        binRepr,
        indexRepr
    };
});

const colors = [
    0xffc500,
    0xf27e00,
    0x91088c,
    0x00ff06,
    0xeb4e4e,
    0xcef900,
    0x51acdc,
    0xf544de
];

export default class Chess extends Phaser.Physics.Arcade.Group {
    static ucb = new UCB(patterns.length);

    constructor(scene, dx, dy) {
        super(scene.physics.world, scene);

        const margin = {
            x: 2.5 * scene.board.tileCTCD,
            y: 7.5 * scene.board.tileCTCD
        }
        const origin = {
            x: scene.board.centre.x + dx * margin.x,
            y: scene.board.centre.y + dy * margin.y
        };

        const patternIndex = Chess.ucb.play();
        Chess.ucb.update(patternIndex, 0);
        const pattern = patterns[patternIndex];

        const { color, colorIndex } = UCB.randomChoice(colors.map((color, colorIndex) => { return { color, colorIndex }; }));
        this.container = scene.add.container(
            origin.x + dx * (scene.cameras.main.width * 0.5 - margin.x),
            origin.y
        );
        this.container.alpha = 0;
        this.container.setSize(
            pattern.binRepr.length * scene.board.tileCTCD,
            pattern.binRepr[0].length * scene.board.tileCTCD
        );
        scene.physics.world.enable(this.container);

        function getOffet(indexRepr) {
            function mean(arr) {
                return (Math.min(...arr) + Math.max(...arr)) / 2;
            }
            let xs = indexRepr.map(e => e[0]);
            let ys = indexRepr.map(e => e[1]);
            return [mean(xs), mean(ys)];
        }

        this.offset = getOffet(pattern.indexRepr);
        this.container.add(
            pattern.indexRepr.map((blockIdxRepr) => {
                let block = scene.add.image(
                    (blockIdxRepr[0] - this.offset[0]) * scene.board.tileCTCD,
                    (blockIdxRepr[1] - this.offset[1]) * scene.board.tileCTCD,
                    "tile"
                );
                block.indexRepr = blockIdxRepr;
                block.displayWidth = block.displayHeight = scene.board.tileSize;
                block.setTint(color);
                return block;
            })
        );
        this.addMultiple(this.container.list);

        this.container.setInteractive({ draggable: true });
        this.container.on("dragstart", function () {
            this.dragging = true;
        });

        this.container.on("drag", function (pointer, dragX, dragY) {

            if (!this.onBoard) {
                this.x = dragX;
                this.y = dragY;
            } else {
                const draggedX = dragX - this.x;
                const deltaX = median([-scene.board.tileCTCD, draggedX, scene.board.tileCTCD]);
                if (deltaX != draggedX) {
                    this.setX(this.x + deltaX);
                }

                const draggedY = dragY - this.y;
                const deltaY = median([-scene.board.tileCTCD, draggedY, scene.board.tileCTCD]);
                if (deltaY != draggedY) {
                    this.setY(this.y + deltaY);
                }

                function median(arr) {
                    return arr.sort((a, b) => {
                        return a - b;
                    })[Math.floor(arr.length / 2)];
                }
            }
        });

        let _this = this;
        this.container.on("dragend", function () {
            this.dragging = false;

            if (this.list.every((block) => !!block.tile && !block.tile.block) &&
                this.list.map((block) => block.indexRepr.map((e, i) => e - block.tile.indexRepr[i]).join(",")).every((v, i, a) => v === a[0])) {

                this.list.forEach((block) => {
                    block.tile.block = scene.add.image(
                        block.tile.x,
                        block.tile.y,
                        "tile"
                    );
                    block.tile.block.displayWidth = block.tile.displayWidth;
                    block.tile.block.displayHeight = block.tile.displayHeight;
                    block.tile.block.setTint(color);
                    block.tile.block.colorIndex = colorIndex;
                });

                this.destroy();
                scene.chesses.splice(scene.chesses.indexOf(_this), 1);
                scene.undoBtn.emit("placechess", _this);

                scene.board.tiles.reduce((matches, row, i) => {
                    return matches.concat([match(row), match(scene.board.tiles.map((row) => row[i]))]);

                    function match(row) {
                        if (row.every((tile) => tile.block)) {
                            return row;
                        }
                        return null
                    }
                }, []).forEach((match) => match && scene.score(match));

                return;
            }

            this.onBoard = false;

            scene.tweens.add({
                targets: this,
                x: origin.x,
                y: origin.y,
                duration: 400,
                ease: "Power2"
            });
        });

        scene.tweens.add({
            targets: this.container,
            x: { start: this.container.x, to: origin.x },
            y: origin.y,
            alpha: { start: 0, to: 1 },
            duration: 400,
            ease: "Power2"
        });
    }
}

import Phaser from "../../libs/phaser-full.min";
import UCB from "./utils/UCB";
import { patterns, colors } from "./Data";

export default class Chess extends Phaser.Physics.Arcade.Group {
    static directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    static ucb = new UCB(patterns.length);

    constructor(scene, dx, dy) {
        super(scene.physics.world, scene);

        const margin = {
            x: 2.5 * scene.board.gridSize,
            y: 7.5 * scene.board.gridSize
        }

        this.origin = {
            x: scene.board.centre.x + dx * margin.x,
            y: scene.board.centre.y + dy * margin.y
        };

        this.start = {
            x: this.origin.x + dx * (scene.cameras.main.width * 0.5 - margin.x),
            y: this.origin.y
        };

        const patternIndex = Chess.ucb.play();
        Chess.ucb.update(patternIndex, 0);
        const pattern = patterns[patternIndex];

        const { color, colorIndex } = UCB.randomChoice(colors.map((color, colorIndex) => { return { color, colorIndex }; }));
        this.color = color;
        this.colorIndex = colorIndex;
        this.container = scene.add.container(this.start.x, this.start.y);
        this.container.alpha = 0;
        this.container.setSize(
            pattern.binRepr.length * scene.board.gridSize,
            pattern.binRepr[0].length * scene.board.gridSize
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
                    (blockIdxRepr[0] - this.offset[0]) * scene.board.gridSize,
                    (blockIdxRepr[1] - this.offset[1]) * scene.board.gridSize,
                    "tile"
                );
                block.indexRepr = blockIdxRepr;
                block.displayWidth = block.displayHeight = scene.board.tileSize;
                block.setTint(color);
                block.colorIndex = this.colorIndex;
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
                const deltaX = median([-scene.board.gridSize, draggedX, scene.board.gridSize]);
                if (deltaX != draggedX) {
                    this.setX(this.x + deltaX);
                }

                const draggedY = dragY - this.y;
                const deltaY = median([-scene.board.gridSize, draggedY, scene.board.gridSize]);
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

                this.setVisible(false);
                scene.events.emit("placechess", _this);

                return scene.audio.playPlaceChess();
            }

            this.onBoard = false;
            _this.moveToOrigin();
        });

        this.enter();
    }

    moveToOrigin() {
        this.scene.tweens.add({
            targets: this.container,
            x: this.origin.x,
            y: this.origin.y,
            duration: 400,
            ease: "Power2"
        });
    }

    enter() {
        this.scene.tweens.add({
            targets: this.container,
            x: { start: this.container.x, to: this.origin.x },
            y: this.origin.y,
            alpha: { start: 0, to: 1 },
            duration: 400,
            ease: "Power2"
        });
    }

    exit() {
        this.scene.tweens.add({
            targets: this.container,
            x: { start: this.container.x, to: this.start.x },
            y: this.start.y,
            alpha: 0,
            duration: 400,
            ease: "Power2"
        });
    }
}

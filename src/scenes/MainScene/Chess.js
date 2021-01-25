import Phaser from "../../libs/phaser-full.min";
import MAB from "./utils/MAB";
import { patterns, colors } from "./Data";
import Block from "./Block";

export default class Chess extends Phaser.Physics.Arcade.Group {
    static directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    static mab = new MAB(patterns.length);

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

        const patternIndex = Chess.mab.play();
        Chess.mab.update(patternIndex);
        const pattern = patterns[patternIndex];

        const { color, colorIndex } = MAB.randomChoice(colors.map((color, colorIndex) => { return { color, colorIndex }; }));
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
                let block = new Block(
                    scene,
                    (blockIdxRepr[0] - this.offset[0]) * scene.board.gridSize,
                    (blockIdxRepr[1] - this.offset[1]) * scene.board.gridSize,
                    blockIdxRepr,
                    colorIndex
                );

                return block;
            })
        );
        this.addMultiple(this.container.list);

        this.container.setInteractive({ draggable: true });
        this.addDragEvents();

        this.enter();
    }

    addDragEvents() {
        let _this = this;
        this.container.on("dragstart", function () {
            this.dragging = true;
            this.setDepth(Infinity);
        });

        this.container.on("drag", function (pointer, dragX, dragY) {

            if (!this.onBoard) {
                this.x = dragX;
                this.y = dragY;
            } else {
                const draggedX = dragX - this.x;
                const deltaX = median([-_this.scene.board.gridSize, draggedX, _this.scene.board.gridSize]);
                if (deltaX != draggedX) {
                    this.setX(this.x + deltaX);
                }

                const draggedY = dragY - this.y;
                const deltaY = median([-_this.scene.board.gridSize, draggedY, _this.scene.board.gridSize]);
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

        this.container.on("dragend", function () {
            this.dragging = false;
            this.setDepth(0);

            if (this.list.every((block) => !!block.tile && !block.tile.occupied) &&
                this.list.map((block) => block.indexRepr.map((e, i) => e - block.tile.indexRepr[i]).join(",")).every((v, i, a) => v === a[0])) {

                this.iterate((block) => block.tile.occupied = true);
                _this.removeDragEvents();
                _this.scene.onPlaceChess(_this);
                return;
            }

            this.onBoard = false;
            _this.moveToOrigin();
        });
    }

    removeDragEvents() {
        this.container.off("dragstart");
        this.container.off("drag");
        this.container.off("dragend");
    }

    commit() {
        this.container.iterate((block) => {
            block.tile.block.setColor(block.colorIndex);
            block.tile.block.setVisible(true);
        });
        this.container.destroy();
    }

    takeback() {
        this.container.iterate((block) => block.tile.occupied = false);
        this.moveToOrigin(() => this.addDragEvents());
    }

    moveToOrigin(onComplete = () => { }) {
        this.scene.tweens.add({
            targets: this.container,
            x: this.origin.x,
            y: this.origin.y,
            duration: 400,
            ease: "Power2",
            onComplete
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

    shake(onComplete = () => { }) {
        this.scene.tweens.add({
            targets: this.container,
            angle: 5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete
        });
    }
}

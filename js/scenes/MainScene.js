import Scene from "./Scene";

export default class MainScene extends Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image("tile", "assets/images/tile.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        let board = this.physics.add.staticGroup();
        let boardMargin = 0.1 * this.cameras.main.width;
        let tileSize = (this.cameras.main.width - 2 * boardMargin) * 0.1;
        let startX = this.cameras.main.centerX - 4.5 * tileSize;
        let startY = this.cameras.main.centerY - 4.5 * tileSize;
        for (let i = 0; i < 100; i++) {
            let tile = board.create(
                startX + (i % 10) * tileSize,
                startY + Math.floor(i / 10) * tileSize,
                "tile"
            );
            tile.displayWidth = tile.displayHeight = tileSize - tilePadding;
            tile.setTint(0xe5e5e5);
        }

        const blocksInitPositions = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => [
            this.cameras.main.centerX + 2.5 * x * tileSize,
            this.cameras.main.centerY + 7.5 * y * tileSize
        ]);

        blocksInitPositions.forEach((p) => {
            const pattern = randomChoice(patterns);
            const color = randomChoice(colors);
            let container = this.add.container(...p);
            container.setSize(pattern[0].length * tileSize, pattern.length * tileSize);

            function getRelativeCentre(pattern) {
                function median(arr) {
                    return (Math.min(...arr) + Math.max(...arr)) / 2;
                }
                let xs = pattern.map(e => e[0]);
                let ys = pattern.map(e => e[1]);
                return [median(xs), median(ys)];
            }

            let relCentre = getRelativeCentre(pattern);
            pattern.forEach((blockIdx) => {
                let block = this.add.sprite(
                    (blockIdx[0] - relCentre[0]) * tileSize,
                    (blockIdx[1] - relCentre[1]) * tileSize,
                    "tile"
                );
                block.displayWidth = block.displayHeight = tileSize - tilePadding;
                block.setTint(color);
                container.add(block);
            });

            container.setInteractive({ draggable: true });
            container.on('drag', function (pointer, dragX, dragY) {
                this.x = dragX;
                this.y = dragY;
            });
        });
    }
}

const tilePadding = 3;

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
}, []).map((pattern) => {
    let indexRepr = [];
    let indexOffset;
    pattern.forEach((row, i) => {
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
    return indexRepr;
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

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
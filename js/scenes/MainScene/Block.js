export default class Block {
    constructor(initPosition, scene) {
        const pattern = randomChoice(patterns);
        const color = randomChoice(colors);
        let container = scene.add.container(...initPosition);
        container.setSize(pattern[0].length * scene.tileSize, pattern.length * scene.tileSize);

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
            let block = scene.add.sprite(
                (blockIdx[0] - relCentre[0]) * scene.tileSize,
                (blockIdx[1] - relCentre[1]) * scene.tileSize,
                "tile"
            );
            block.displayWidth = block.displayHeight = scene.tileSize - scene.tilePadding;
            block.setTint(color);
            container.add(block);
        });

        container.setInteractive({ draggable: true });
        container.on("drag", function (pointer, dragX, dragY) {
            this.x = dragX;
            this.y = dragY;
        });

        container.on("dragend", function (pointer, dragX, dragY) {
            scene.tweens.add({
                targets: container,
                x: initPosition[0],
                y: initPosition[1],
                duration: 400,
                ease: 'Power2'
            });
        });
    }
}

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
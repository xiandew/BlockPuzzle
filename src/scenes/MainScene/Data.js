export const patterns = [
    [
        [0, 1, 0],
        [1, 1, 1]
    ], [
        [1, 0, 0],
        [1, 1, 1]
    ], [
        [0, 0, 1],
        [1, 1, 1]
    ], [
        [1, 1, 0],
        [0, 1, 1]
    ], [
        [0, 1, 1],
        [1, 1, 0]
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

export const colors = [
    0xffc500,
    0xf27e00,
    0x91088c,
    0x00c777,
    0xeb4e4e,
    0xcae21c,
    0x51acdc,
    0xf544de
];

const dim = process.argv[2]

if (dim > 0) {
    const mtx = fillMatrix(dim)
    expandMatrix(mtx) // прямо от центра по часовой
    expandMatrixReverse(mtx) // с конца против часовой к центру
}

function fillMatrix(n) {
    let d = n * 2 - 1
    let mtx = []
    let count = 9

    for (let i = 0; i < d; i++){
        mtx[i] = [];
        for (let j = 0; j < d; j++){
            mtx[i][j] = ++count;
    }}

    mtx.forEach(row => console.log(...row))

    return mtx
}

// O(mn)
function expandMatrix(mtx) {
    const center = (mtx.length - 1) / 2
    let left = center - 1
    let top = center - 1
    let right = center + 1
    let bottom = center + 1
    let queue = []
    queue.push(mtx[center][center])
    let i = 0

    while (left >= 0 && right <= mtx.length - 1 && top >= 0 && bottom <= mtx.length -1) {
        for (i = bottom - 1; i > top; --i) {
            queue.push(mtx[i][left])            
        }
        left--

        for (i = left + 1; i <= right; ++i) {
            queue.push(mtx[top][i])            
        }
        top--

        for (i = top + 2; i < bottom; ++i) {
            queue.push(mtx[i][right])            
        }
        right++

        for (i = right - 1; i >= left + 1; --i) {
            queue.push(mtx[bottom][i])            
        }
        bottom++
    }
    console.log(...queue)
}

// O(mn)
function expandMatrixReverse(mtx) {
    let right = mtx[0].length - 1
    let bottom = mtx.length - 1
    let stack = []
    let left = 0
    let top = 0
    let i
     
    while(left <= right && top <= bottom) {
        for(i = left; i < right + 1; ++i) {
            stack.push(mtx[bottom][i])
        }
        --bottom

        for(i = bottom; i >= top; --i) {
            stack.push(mtx[i][right])
        }
        --right

        for(i = right; i >= left; --i) {
            stack.push(mtx[top][i])
        }
        ++top

        for(i = top; i <= bottom; ++i) {
            stack.push(mtx[i][left])
        }
        ++left
    }

    console.log('\x1b[35m%s\x1b[0m', stack.reverse().join(' '))
}

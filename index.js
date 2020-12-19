const DOT_RADIUS = 6
const DOT_DIAMETER = DOT_RADIUS * 2
const DOT_SPACING = 45
const GRID_PADDING = DOT_SPACING / 2
const MOUSE_DISTANCE = 15

let dotArray = []
let squaresArray = []
let linksArray = []
let origin = null
let dotCount = 0
let colours = {p1: null, p2: null}
let turn = 'p1'
let scores = {
    p1: 0, p2: 0
}
const canvas = document.querySelector('canvas')

const mouse = {
    x: undefined,
    y: undefined
}

const click = {
    x: undefined,
    y: undefined
}

const c = canvas.getContext('2d');

function Dot(x, y, radius, gx, gy) {
    this.x = x
    this.y = y
    this.radius = radius
    this.gx = gx
    this.gy = gy

    this.draw = function () {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
        c.fillStyle = 'white'
        c.fill()
    }

    this.update = function () {
        if ((mouse.x - this.x < MOUSE_DISTANCE && mouse.x - this.x > -MOUSE_DISTANCE &&
            mouse.y - this.y < MOUSE_DISTANCE && mouse.y - this.y > -MOUSE_DISTANCE) ||
            origin === this) {
            this.radius = DOT_RADIUS * 1.5
        } else {
            this.radius = DOT_RADIUS
        }

        if (click.x < this.x + this.radius && click.x > this.x - this.radius &&
            click.y < this.y + this.radius && click.y > this.y - this.radius) {
            if (origin) {
                if (checkValidMove(this)) {
                    createLink(this)
                } else {
                    origin = null
                }
            } else {
                origin = this
            }

            click.x = undefined
            click.y = undefined
        }

        this.draw()
    }
}

function Link(start, end) {
    if (start.gy === end.gy) {
        if (start.gx < end.gx) {
            this.start = start
            this.end = end
        } else {
            this.start = end
            this.end = start
        }
    } else if (start.gy < end.gy) {
        this.start = start
        this.end = end
    } else {
        this.start = end
        this.end = start
    }

    this.draw = function () {
        c.beginPath()
        c.lineWidth = 5
        c.moveTo(this.start.x, this.start.y)
        c.lineTo(this.end.x, this.end.y)
        c.strokeStyle = '#aaa'
        c.stroke()
    }
}

function Square(startX, startY, endX, endY, colour) {
    this.sX = startX
    this.sY = startY
    this.eX = endX
    this.eY = endY
    this.colour = colour

    updateScores()

    this.draw = function () {
        c.fillStyle = this.colour
        c.fillRect(this.sX, this.sY, this.eX, this.eY)
    }
}

const renderActiveLink = () => {
    c.beginPath()
    c.lineWidth = 5
    c.shadowBlur = 0
    c.moveTo(origin.x, origin.y)
    c.lineTo(mouse.x, mouse.y)
    c.strokeStyle = '#aaa'
    c.stroke()
}

const checkValidMove = (target) => {
    if (linksArray.find(link =>
        (origin.gx === link.start.gx && origin.gy === link.start.gy
            && target.gx === link.end.gx && target.gy === link.end.gy) ||
        (origin.gx === link.end.gx && origin.gy === link.end.gy
            && target.gx === link.start.gx && target.gy === link.start.gy)
    )) return false

    return ((origin.gx === target.gx - 1 || origin.gx === target.gx + 1) && origin.gy === target.gy) ||
        ((origin.gy === target.gy - 1 || origin.gy === target.gy + 1) && origin.gx === target.gx)
}

const createLink = (target) => {
    const newLink = new Link(origin, target)
    linksArray.push(newLink)

    let squareCount = squaresArray.length
    checkForSquare(newLink)
    origin = null

    if (squareCount === squaresArray.length) {
        turn = turn === 'p1' ? 'p2' : 'p1'
        document.querySelector('#turn').classList.toggle('p2-turn')
    }
}

const checkForSquare = (link) => {
    const {gy, gx} = link.start
    switch (link.end.gy) {
        case gy:
            if (gy !== 0) {
                const upperLeft = linksArray.find(l => l.start.gy === gy - 1 && l.end.gy === gy && l.start.gx === gx)
                const upperTop = linksArray.find(l => l.start.gx === gx && l.end.gx === link.end.gx && l.start.gy === gy - 1)
                const upperRight = linksArray.find(l => l.start.gy === gy - 1 && l.end.gy === gy && l.start.gx === link.end.gx)

                if (upperLeft && upperTop && upperRight) {
                    squaresArray.push(new Square(upperTop.start.x, upperTop.start.y, DOT_SPACING, DOT_SPACING, colours[turn]))
                }
            }

            if (gy !== dotCount - 1) {
                const lowerLeft = linksArray.find(l => l.start.gy === gy && l.end.gy === gy + 1 && l.start.gx === gx)
                const lowerBottom = linksArray.find(l => l.start.gx === gx && l.end.gx === link.end.gx && l.start.gy === gy + 1)
                const lowerRight = linksArray.find(l => l.start.gy === link.end.gy && l.end.gy === link.end.gy + 1 && l.start.gx === link.end.gx)

                if (lowerLeft && lowerBottom && lowerRight) {
                    squaresArray.push(new Square(lowerLeft.start.x, lowerLeft.start.y, DOT_SPACING, DOT_SPACING, colours[turn]))
                }
            }
            break;
        default:
            if (gx !== 0) {
                const leftTop = linksArray.find(l => l.start.gx === gx - 1 && l.end.gx === gx && l.start.gy === gy)
                const leftLeft = linksArray.find(l => l.start.gy === gy && l.end.gy === link.end.gy && l.start.gx === gx - 1)
                const leftBottom = linksArray.find(l => l.start.gx === link.end.gx - 1 && l.end.gx === link.end.gx && l.start.gy === link.end.gy)

                if (leftTop && leftLeft && leftBottom) {
                    squaresArray.push(new Square(leftTop.start.x, leftTop.start.y, DOT_SPACING, DOT_SPACING, colours[turn]))
                }
            }

            if (!(gx === dotCount - 1)) {
                const rightTop = linksArray.find(l => l.start.gx === gx && l.end.gx === gx + 1 && l.start.gy === gy)
                const rightRight = linksArray.find(l => l.start.gy === gy && l.end.gy === link.end.gy && l.start.gx === gx + 1)
                const rightBottom = linksArray.find(l => l.start.gx === link.end.gx && l.end.gx === link.end.gx + 1 && l.start.gy === link.end.gy)

                if (rightTop && rightRight && rightBottom) {
                    squaresArray.push(new Square(rightTop.start.x, rightTop.start.y, DOT_SPACING, DOT_SPACING, colours[turn]))
                }
            }
            break
    }
}

const drawDots = (dotCount) => {
    for (let i = 0; i < dotCount; i++) {
        for (let j = 0; j < dotCount; j++) {
            dotArray.push(new Dot(
                i * DOT_SPACING + (GRID_PADDING + DOT_RADIUS),
                j * DOT_SPACING + (GRID_PADDING + DOT_RADIUS),
                DOT_RADIUS, i, j)
            )
        }
    }
}

const showWinner = () => {
    if (scores.p1 === scores.p2) {
        document.querySelector('.info').innerHTML = `Draw!`
    } else {
        document.querySelector('.info').innerHTML = `Winner is ${scores.p1 > scores.p2 ? 'Player 1' : 'Player 2'}`
    }
    document.querySelector('.info').style.display = 'block'
    document.getElementsByClassName('playAgain')[0].style.display = 'block'
    document.querySelector('canvas').style.display = 'none'
}

const animate = () => {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight)
    for (let item of squaresArray) {
        item.draw()
    }
    for (let item of linksArray) {
        item.draw()
    }
    if (!origin) {
    } else {
        renderActiveLink()
    }
    for (let item of dotArray) {
        item.update()
    }
    if (squaresArray.length !== Math.pow(dotCount - 1, 2)) {
        return
    }
    showWinner()
}

window.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.x - rect.left
    mouse.y = e.y - rect.top
});

window.addEventListener('mousedown', function (e) {
    const rect = canvas.getBoundingClientRect()
    click.x = e.x - rect.left
    click.y = e.y - rect.top
});

const resetField = () => {
    scores = {p1: 0, p2: 0}
    document.querySelector(`#p1Score`).innerHTML = '0'
    document.querySelector(`#p2Score`).innerHTML = '0'
    document.querySelector('canvas').style.display = 'block'
    document.querySelector('#turn').classList.toggle('p2-turn')
    document.querySelector('.info').style.display = 'none'
    document.getElementsByClassName('playAgain')[0].style.display = 'none'
    squaresArray = []
    linksArray = []
    turn = 'p1'
}

init()

function init() {
    dotCount = document.querySelector('#gridSize').value
    colours.p1 = document.querySelector('#p1Colour').value
    colours.p2 = document.querySelector('#p2Colour').value

    const size = GRID_PADDING * 2
        + ((DOT_RADIUS * 2) * dotCount)
        + ((DOT_SPACING - DOT_DIAMETER) * (dotCount - 1))

    canvas.width = size
    canvas.height = size
    squaresArray = []
    linksArray = []
    dotArray = []
    resetField()
    drawDots(dotCount)

    if (squaresArray.length !== Math.pow(dotCount - 1, 2)) {
        animate()
    }
}

const changeSquareColour = (e, player) => {
    const oldColour = colours[`p${player}`]
    const newColour = e.target.value

    let playerSquares = squaresArray.filter(square => square.colour === oldColour)
    playerSquares.forEach(square => square.colour = newColour)

    colours[`p${player}`] = newColour
}

const updateScores = () => {
    scores[turn] = scores[turn] + 1
    document.querySelector(`#${turn}Score`).innerHTML = scores[turn]
}

document.querySelector('#gridSize').addEventListener('change', function () {
    init()
})

document.querySelector('#p1Colour').addEventListener('change', function (e) {
    changeSquareColour(e, 1)
})

document.querySelector('#p2Colour').addEventListener('change', function (e) {
    changeSquareColour(e, 2)
})

const dotRadius = 6
const dotDiameter = dotRadius * 2
const dotSpacing = 45
const padding = dotSpacing / 2
const mouseDistance = 15

let turn = 'p1'
let dotArray = []
let squaresArray = []
let linksArray = []
let origin = null
let dotCount = 0
let color = {
    p1: 'red', p2: 'purple'
}
let score = {
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
        if ((mouse.x - this.x < mouseDistance && mouse.x - this.x > -mouseDistance &&
            mouse.y - this.y < mouseDistance && mouse.y - this.y > -mouseDistance) ||
            origin === this) {
            this.radius = dotRadius * 1.5
        } else {
            this.radius = dotRadius
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
                    squaresArray.push(new Square(upperTop.start.x, upperTop.start.y, dotSpacing, dotSpacing, color[turn]))
                }
            }

            if (gy !== dotCount - 1) {
                const lowerLeft = linksArray.find(l => l.start.gy === gy && l.end.gy === gy + 1 && l.start.gx === gx)
                const lowerBottom = linksArray.find(l => l.start.gx === gx && l.end.gx === link.end.gx && l.start.gy === gy + 1)
                const lowerRight = linksArray.find(l => l.start.gy === link.end.gy && l.end.gy === link.end.gy + 1 && l.start.gx === link.end.gx)

                if (lowerLeft && lowerBottom && lowerRight) {
                    squaresArray.push(new Square(lowerLeft.start.x, lowerLeft.start.y, dotSpacing, dotSpacing, color[turn]))
                }
            }
            break;
        default:
            if (gx !== 0) {
                const leftTop = linksArray.find(l => l.start.gx === gx - 1 && l.end.gx === gx && l.start.gy === gy)
                const leftLeft = linksArray.find(l => l.start.gy === gy && l.end.gy === link.end.gy && l.start.gx === gx - 1)
                const leftBottom = linksArray.find(l => l.start.gx === link.end.gx - 1 && l.end.gx === link.end.gx && l.start.gy === link.end.gy)

                if (leftTop && leftLeft && leftBottom) {
                    squaresArray.push(new Square(leftTop.start.x, leftTop.start.y, dotSpacing, dotSpacing, color[turn]))
                }
            }

            if (!(gx === dotCount - 1)) {
                const rightTop = linksArray.find(l => l.start.gx === gx && l.end.gx === gx + 1 && l.start.gy === gy)
                const rightRight = linksArray.find(l => l.start.gy === gy && l.end.gy === link.end.gy && l.start.gx === gx + 1)
                const rightBottom = linksArray.find(l => l.start.gx === link.end.gx && l.end.gx === link.end.gx + 1 && l.start.gy === link.end.gy)

                if (rightTop && rightRight && rightBottom) {
                    squaresArray.push(new Square(rightTop.start.x, rightTop.start.y, dotSpacing, dotSpacing, color[turn]))
                }
            }
            break
    }
}

const drawDots = (dotCount) => {
    for (let i = 0; i < dotCount; i++) {
        for (let j = 0; j < dotCount; j++) {
            dotArray.push(new Dot(
                i * dotSpacing + (padding + dotRadius),
                j * dotSpacing + (padding + dotRadius),
                dotRadius, i, j)
            )
        }
    }
}

const showWinner = () => {
    if (score.p1 === score.p2) {
        document.querySelector('.info').innerHTML = `Draw!`
    } else {
        document.querySelector('.info').innerHTML = `Winner is ${score.p1 > score.p2 ? 'Player 1' : 'Player 2'}`
    }
    document.querySelector('.info').style.display = 'block'
    document.getElementsByClassName('playAgain')[0].style.display = 'block'
    document.querySelector('canvas').style.display = 'none'
    document.querySelector('#turn').classList.toggle('p2-turn')
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
    score = {p1: 0, p2: 0}
    document.querySelector(`#p1Score`).innerHTML = '0'
    document.querySelector(`#p2Score`).innerHTML = '0'
    document.querySelector('canvas').style.display = 'block'
    document.querySelector('.info').style.display = 'none'
    document.getElementsByClassName('playAgain')[0].style.display = 'none'
    squaresArray = []
    linksArray = []
    turn = 'p1'
}

init()

function init() {
    dotCount = document.querySelector('#gridSize').value

    const size = padding * 2
        + ((dotRadius * 2) * dotCount)
        + ((dotSpacing - dotDiameter) * (dotCount - 1))

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

const updateScores = () => {
    score[turn] = score[turn] + 1
    document.querySelector(`#${turn}Score`).innerHTML = score[turn]
}

document.querySelector('#gridSize').addEventListener('change', function () {
    init()
})

let tSwitcher = document.getElementById('theme-switcher')
let element = document.body;
let onpageLoad;
if(localStorage.getItem("theme")){
    onpageLoad = localStorage.getItem("theme")
}
if (onpageLoad != null && onpageLoad == 'dark-mode') {
    tSwitcher.checked = true
}
element.classList.add(onpageLoad)

function themeToggle() {
    if (tSwitcher.checked) {
        localStorage.setItem('theme', 'dark-theme')
        element.classList.add('dark-theme')
    } else {
        localStorage.setItem('theme', '')
        element.classList.remove('dark-theme')
    }
}

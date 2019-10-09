var qtree
var imageData
var detailInfo
var pairs

var canvasElem

var running = false
var DEBUG = false

var maxFails = 0
var options

function setup() {
    imageInput.addEventListener("change", function() {
        if (this.files && this.files[0]) {
            img.src = URL.createObjectURL(this.files[0])
            img.onload = () => newImage()
        }
    })
}

function getOptions() {
    return JSON.parse(optionsInput.value.replace(/\/\/[^\n]*\n/g, ""))
}

var lastImageSrc
var lastOptions
function maybeUpdateImageData() {
    let detailOptions = {
        blur: {
            blurWidth: options.detailBlurWidth,
            blurPasses: options.detailBlurPasses,
        },
        gradientFunction: options.gradientFunction
    }
    let optionsStr = JSON.stringify(detailOptions)
    if (img.src == lastImageSrc && optionsStr == lastOptions)
        return

    imageData = getImageData(img, 1)
    detailInfo = new DetailInfo(imageData, detailOptions)

    lastOptions = optionsStr
    lastImageSrc = img.src
}

function newImage() {
    options = getOptions()

    let canvas = createCanvas(img.width * options.imageScale, img.height * options.imageScale)
    canvas.parent("sketch")
    canvasElem = canvas.canvas

    background(options.backgroundColor)
    noFill()

    maybeUpdateImageData()

    let centerX = width / 2
    let centerY = height / 2

    qtree = new QTree(0, 0, width, height)

    pairs = []

    let A = new Circle(centerX - options.minRadius, centerY, options.minRadius)
    let B = new Circle(centerX + options.minRadius, centerY, options.minRadius)

    addCircle(A)
    addCircle(B)

    running = true
}

function draw() {
    if (!running)
        return
    for (var i = 0; i < options.circlesPerFrame; i++) {
        if (pairs.length == 0) {
            noLoop()
            break
        }
        generateCircle()
    }
    if (DEBUG)
        qtree.draw()
}

function generateCircle() {
    let pairNum = random(0, pairs.length) | 0
    let pair = pairs[pairNum]
    let side = pair.pickSide()

    let low = options.minRadius
    let high = options.maxRadius
    let radius
    let circle

    // Binary search for ideal radius. 
    // We don't want to collide or enclose too much detail.
    for (let i = 0; i < options.radiusBinarySearchSteps; i++) {
        radius = (low + high) / 2
        let n = neighborCircles(radius, pair.a, pair.b)
        circle = n[side]
        let d = detail(circle.pos, radius)
        if (d > options.maxDetail || qtree.doesCollide(circle, 1) || outOfBounds(circle.pos))
            high = radius
        else
            low = radius
    }

    radius = low
    circle = neighborCircles(radius, pair.a, pair.b)[side]
    if (!qtree.doesCollide(circle, 1))
        addCircle(circle)
    else
        failPair(pairNum, side)

}

function neighborCircles(xRadius, y, z) {
    //The tangent circles x, y and z form a triangle.
    //The legs of the triangle are a, b and c.
    //C is the angle opposite of c.
    //It is also the angle from y to x.

    var a = y.pos.dist(z.pos)
    var b = xRadius + y.radius
    var c = xRadius + z.radius

    var cosAngle = (a * a + b * b - c * c) / (2 * a * b)  //The value of cos(C) by the Law of Cosines.
    var sinAngle = Math.sqrt(1 - cosAngle * cosAngle)

    var heading = sub(z.pos, y.pos)
    heading.normalize()
    var right = vec(-heading.y, heading.x)

    var relRight = add(
        mul(heading, cosAngle * b),
        mul(right, sinAngle * b)
    )

    var relLeft = add(
        mul(heading, cosAngle * b),
        mul(right, sinAngle * -b)
    )

    return [
        new Circle(relRight.x + y.pos.x, relRight.y + y.pos.y, xRadius),
        new Circle(relLeft.x + y.pos.x, relLeft.y + y.pos.y, xRadius)
    ];
}

function addCircle(circle) {
    qtree.tryAdd(circle)

    var scanCircle = new Circle(circle.pos.x, circle.pos.y, circle.radius * options.pairRadiusScanFactor)
    var nearContacts = []
    qtree.contacts(scanCircle, nearContacts)

    for (var contact of nearContacts)
        addPair(new Pair(circle, contact))

    circle.draw()
}

function detail(pos, radius) {
    let x = Math.round(pos.x / options.imageScale)
    let y = Math.round(pos.y / options.imageScale)
    let r = Math.round(radius / options.imageScale)

    return detailInfo.detailInBox(x, y, r)
}

function addPair(pair) {
    pairs.push(pair)
    if (DEBUG) {
        stroke(0, 255, 0)
        line(pair.a.pos.x, pair.a.pos.y, pair.b.pos.x, pair.b.pos.y)
    }
}

function failPair(pairNum, side) {
    var pair = pairs[pairNum]
    pair.fails[side]++
    if (pair.isFailed()) {
        pairs[pairNum] = pairs[pairs.length - 1]
        pairs.pop()
        if (DEBUG) {
            stroke(255, 0, 0)
            line(pair.a.pos.x, pair.a.pos.y, pair.b.pos.x, pair.b.pos.y)
        }
    }
}

function download() {
    canvasElem.toBlob((blob) => {
        let url = URL.createObjectURL(blob)
        let link = document.createElement("a")
        link.download = "circlify.png"
        link.href = url //canvasElem.toDataURL("image/png")
        link.click()
    })
}
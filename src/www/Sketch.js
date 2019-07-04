var qtree
var imageData
var detailInfo

var DEBUG = false

var minRadius = 1
var maxRadius = 400
var imageScale = 1
var maxDetail = 100000 * 0.1
var pairRadiusScanFactor = 1.01
var radiusBinarySearchSteps = 32
var detailBlurPasses = 10
var detailBlurWidth = 5

var circlesPerFrame = 2000

var backgroundColor = 100
var circleStyle = "solid" // solid | dark-ring | light-ring | just-ring | outline

function setup() {
    createCanvas( img.width * imageScale, img.height * imageScale )
    background( backgroundColor )
    noFill()

    imageData = getImageData( img, imageScale )
    detailInfo = new DetailInfo( imageData, {
        blur: {
            blurWidth: detailBlurWidth,
            blurPasses: detailBlurPasses
        }
    } )

    let centerX = width / 2
    let centerY = height / 2

    qtree = new QTree( 0, 0, width, height )

    let A = new Circle( centerX - minRadius, centerY, minRadius )
    let B = new Circle( centerX + minRadius, centerY, minRadius )

    addCircle( A )
    addCircle( B )
}

function draw() {
    for ( var i = 0; i < circlesPerFrame; i++ ) {
        if ( pairs.length == 0 ) {
            noLoop()
            break
        }
        generateCircle()
    }
    if ( DEBUG )
        qtree.draw()
}

function generateCircle() {
    let pairNum = random( 0, pairs.length ) | 0
    let pair = pairs[ pairNum ]
    let side = pair.pickSide()

    let low = minRadius
    let high = maxRadius
    let radius
    let circle

    // Binary search for ideal radius. 
    // We don't want to collide or enclose too much detail.
    for ( let i = 0; i < radiusBinarySearchSteps; i++ ) {
        radius = ( low + high ) / 2
        let n = neighborCircles( radius, pair.a, pair.b )
        circle = n[ side ]
        let d = detail( circle.pos, radius )
        if ( d > maxDetail || qtree.doesCollide( circle, 1 ) || outOfBounds( circle.pos ) )
            high = radius
        else
            low = radius
    }

    radius = low
    circle = neighborCircles( radius, pair.a, pair.b )[ side ]
    if ( !qtree.doesCollide( circle, 1 ) )
        addCircle( circle )
    else
        failPair( pairNum, side )

}

function neighborCircles( xRadius, y, z ) {
    //The tangent circles x, y and z form a triangle.
    //The legs of the triangle are a, b and c.
    //C is the angle opposite of c.
    //It is also the angle from y to x.

    var a = y.pos.dist( z.pos )
    var b = xRadius + y.radius
    var c = xRadius + z.radius

    var cosAngle = ( a * a + b * b - c * c ) / ( 2 * a * b )  //The value of cos(C) by the Law of Cosines.
    var sinAngle = Math.sqrt( 1 - cosAngle * cosAngle )

    var heading = sub( z.pos, y.pos )
    heading.normalize()
    var right = vec( -heading.y, heading.x )

    var relRight = add(
        mul( heading, cosAngle * b ),
        mul( right, sinAngle * b )
    )

    var relLeft = add(
        mul( heading, cosAngle * b ),
        mul( right, sinAngle * -b )
    )

    return [
        new Circle( relRight.x + y.pos.x, relRight.y + y.pos.y, xRadius ),
        new Circle( relLeft.x + y.pos.x, relLeft.y + y.pos.y, xRadius )
    ];
}

function addCircle( circle ) {
    qtree.tryAdd( circle )

    var scanCircle = new Circle( circle.pos.x, circle.pos.y, circle.radius * pairRadiusScanFactor )
    var nearContacts = []
    qtree.contacts( scanCircle, nearContacts )

    for ( var contact of nearContacts )
        addPair( new Pair( circle, contact ) )

    circle.draw()
}

function detail( pos, radius ) {
    let x = Math.round( pos.x )
    let y = Math.round( pos.y )
    let r = Math.round( radius )

    return detailInfo.detailInBox( x, y, r )
}
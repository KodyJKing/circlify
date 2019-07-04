var qtree
var imageData
var detailInfo

var DEBUG = false

var minRadius = 2
var maxRadius = 400
var imageScale = 2
var maxDetail = 100000 * 0.5
var pairRadiusScanFactor = 1.01

var backgroundColor = 0

function setup() {
    createCanvas( img.width * imageScale, img.height * imageScale )
    background( backgroundColor )
    noFill()

    initImage()

    let centerX = width / 2;
    let centerY = height / 2;

    qtree = new QTree( 0, 0, width, height )

    let A = new Circle( centerX - minRadius, centerY, minRadius )
    let B = new Circle( centerX + minRadius, centerY, minRadius )

    addCircle( A )
    addCircle( B )
}

function initImage() {
    let canvas = document.createElement( "canvas" )
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext( "2d" )
    ctx.scale( imageScale, imageScale )
    ctx.drawImage( img, 0, 0 )
    imageData = ctx.getImageData( 0, 0, width, height )
    detailInfo = new DetailInfo( imageData )
}

function draw() {
    for ( var i = 0; i < 100; i++ ) {
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
    for ( let i = 0; i < 20; i++ ) {
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


function outOfBounds( a ) {
    return a.x < 0 || a.x >= width || a.y < 0 || a.y >= height
}
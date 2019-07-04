function vec( x = 0, y = 0 ) {
	return createVector( x, y )
}

function add( a, b ) {
	let v = vec()
	v.x = a.x + b.x
	v.y = a.y + b.y
	return v;
}

function sub( a, b ) {
	let v = vec()
	v.x = a.x - b.x
	v.y = a.y - b.y
	return v;
}

function mul( a, b ) {
	if ( !b ) b = 0
	let v = vec()
	v.x = a.x * b
	v.y = a.y * b
	return v;
}

function rectContains( x, y, w, h, pt ) {
	return x < pt.x && x + w > pt.x
		&& y < pt.y && y + h > pt.y
}

function circleContains( x, y, radius, pt ) {
	var diff = sub( vec( x, y ), pt )
	return diff.magSq() < radius * radius
}

function outOfBounds( a ) {
	return !rectContains( 0, 0, width, height, a )
}

function getImageData( image, scale ) {
	let canvas = document.createElement( "canvas" )
	canvas.width = image.width * scale
	canvas.height = image.height * scale
	let ctx = canvas.getContext( "2d" )
	ctx.scale( scale, scale )
	ctx.drawImage( image, 0, 0 )
	return ctx.getImageData( 0, 0, canvas.width, canvas.height )
}
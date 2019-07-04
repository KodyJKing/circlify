var maxDensity = 10
var maxDepth = 8

class QTree {

	constructor( x, y, w, h ) {
		this.pos = vec( x, y )
		this.w = w
		this.h = h

		this.circles = []
		this.children = null

		this.center = vec( x + w / 2, y + h / 2 )

		this.depth = 0
	}

	contais( pt ) {
		return this.pos.x < pt.x && this.pos.x + this.w > pt.x
			&& this.pos.y < pt.y && this.pos.y + this.h > pt.y
	}

	intersects( circle ) {
		if ( !rectContains(
			this.pos.x - circle.radius, this.pos.y - circle.radius,
			this.w + 2 * circle.radius, this.h + 2 * circle.radius,
			circle.pos
		) )
			return false

		if ( rectContains(
			this.pos.x, this.pos.y - circle.radius,
			this.w, this.h + 2 * circle.radius,
			circle.pos
		) )
			return true

		if ( rectContains(
			this.pos.x - circle.radius, this.pos.y,
			this.w + circle.radius * 2, this.h,
			circle.pos
		) )
			return true

		if ( circleContains( this.pos.x, this.pos.y, circle.radius, circle.pos ) )
			return true

		if ( circleContains( this.pos.x + this.w, this.pos.y, circle.radius, circle.pos ) )
			return true

		if ( circleContains( this.pos.x, this.pos.y + this.h, circle.radius, circle.pos ) )
			return true

		if ( circleContains( this.pos.x + this.w, this.pos.y + this.h, circle.radius, circle.pos ) )
			return true

		return false
	}

	tryAdd( circle ) {
		if ( !this.intersects( circle ) )
			return

		if ( this.circles != null ) {
			this.circles.push( circle )
			if ( this.circles.length > maxDensity && this.depth < maxDepth )
				this.split()
			return
		}

		for ( let child of this.children )
			child.tryAdd( circle )
	}

	split() {
		let halfW = this.w / 2
		let halfH = this.h / 2
		this.children = [
			new QTree( this.pos.x, this.pos.y, halfW, halfH ),
			new QTree( this.pos.x + halfW, this.pos.y, halfW, halfH ),
			new QTree( this.pos.x, this.pos.y + halfH, halfW, halfH ),
			new QTree( this.pos.x + halfW, this.pos.y + halfH, halfW, halfH )
		]

		for ( let child of this.children ) {
			child.depth = this.depth + 1
			for ( let circle of this.circles )
				child.tryAdd( circle );
		}

		this.circles = null
	}

	draw() {
		push()
		noFill()
		stroke( 100, 100, 255 )
		rect( this.pos.x, this.pos.y, this.w, this.h )

		if ( this.children != null )
			for ( let child of this.children )
				child.draw()
		pop()
	}

	doesCollide( circle, epsilon = 0 ) {
		if ( !this.intersects( circle ) )
			return false

		if ( this.children != null ) {
			for ( let child of this.children )
				if ( child.doesCollide( circle, epsilon ) )
					return true
			return false
		}

		for ( let other of this.circles )
			if ( other != circle && other.intersects( circle, epsilon ) )
				return true

		return false
	}

	contacts( circle, out = [] ) {
		if ( !this.intersects( circle ) )
			return out

		if ( this.children != null ) {
			for ( let child of this.children )
				child.contacts( circle, out )
			return out
		}

		for ( let other of this.circles )
			if ( other.intersects( circle ) )
				out.push( other )

		return out
	}
}
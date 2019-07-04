class Circle {

    constructor( x, y, radius ) {
        this.pos = vec( x, y, true )
        this.radius = radius
    }

    draw( r, g, b ) {
        if ( DEBUG )
            this.drawBasic( r, g, b )
        else
            this.drawVivid()
    }

    drawVivid() {
        let pixels = imageData.data
        let index = ( ( this.pos.y | 0 ) * width + ( this.pos.x | 0 ) ) * 4
        let color = [
            pixels[ index ],
            pixels[ index + 1 ],
            pixels[ index + 2 ]
        ]

        push()
        switch ( circleStyle ) {

            case "dark-ring": {
                fill( color[ 0 ] * 0.7, color[ 1 ] * 0.7, color[ 2 ] * 0.7 )
                noStroke()
                ellipse( this.pos.x, this.pos.y, this.radius * 2 )
                fill( color[ 0 ], color[ 1 ], color[ 2 ] )
                ellipse( this.pos.x, this.pos.y, this.radius * 1.5 )
                break
            }

            case "light-ring": {
                fill( color[ 0 ], color[ 1 ], color[ 2 ] )
                noStroke()
                ellipse( this.pos.x, this.pos.y, this.radius * 2 )
                fill( color[ 0 ] * 0.7, color[ 1 ] * 0.7, color[ 2 ] * 0.7 )
                ellipse( this.pos.x, this.pos.y, this.radius * 1.5 )
                break
            }

            case "just-ring": {
                fill( color[ 0 ], color[ 1 ], color[ 2 ] )
                noStroke()
                ellipse( this.pos.x, this.pos.y, this.radius * 2 )
                fill( backgroundColor )
                ellipse( this.pos.x, this.pos.y, this.radius * 1.5 )
                break
            }

            case "outline": {
                noFill()
                stroke( color[ 0 ], color[ 1 ], color[ 2 ] )
                ellipse( this.pos.x, this.pos.y, this.radius * 2 )
                break
            }

            case "solid": {
                fill( color[ 0 ], color[ 1 ], color[ 2 ] )
                noStroke()
                ellipse( this.pos.x, this.pos.y, this.radius * 2 )
                break
            }

        }
        pop()

    }

    drawBasic( r, g, b ) {
        if ( !r ) r = 0
        if ( !g ) g = 0
        if ( !b ) b = 0
        push()
        noFill()
        stroke( r, g, b )
        ellipse( this.pos.x, this.pos.y, this.radius * 2 )
        pop()
    }

    intersects( other, epsilon = 0 ) {
        var minDist = this.radius + other.radius

        var diff = sub( this.pos, other.pos )

        if ( diff.magSq() < minDist * minDist - epsilon )
            return true
    }

    contains( pt ) {
        return pt.dist( this.pos ) < this.radius
    }
}
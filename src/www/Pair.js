var maxFails = 0
var pairs = []

class Pair {
    constructor( a, b ) {
        this.a = a
        this.b = b

        this.fails = [ 0, 0 ]
    }

    pickSide() {
        if ( this.fails[ 0 ] > maxFails )
            return 1
        if ( this.fails[ 1 ] > maxFails )
            return 0
        return random( 0, 2 ) | 0
    }

    isFailed() {
        return this.fails[ 0 ] > maxFails && this.fails[ 1 ] > maxFails
    }
}

function addPair( pair ) {
    pairs.push( pair )
    if ( DEBUG ) {
        stroke( 0, 255, 0 )
        line( pair.a.pos.x, pair.a.pos.y, pair.b.pos.x, pair.b.pos.y )
    }
}

function failPair( pairNum, side ) {
    var pair = pairs[ pairNum ]
    pair.fails[ side ]++
    if ( pair.isFailed() ) {
        pairs[ pairNum ] = pairs[ pairs.length - 1 ]
        pairs.pop()
        if ( DEBUG ) {
            stroke( 255, 0, 0 )
            line( pair.a.pos.x, pair.a.pos.y, pair.b.pos.x, pair.b.pos.y )
        }
    }
}
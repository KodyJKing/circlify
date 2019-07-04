class DetailInfo {
    constructor( imageData ) {
        let pixels = imageData.data
        let { height, width } = imageData

        this.detail = new Uint32Array( width * height )

        // Calculate cumulative detail for each row.
        for ( let y = 0; y < height; y++ ) {
            let sum = 0
            for ( let x = 0; x < width; x++ ) {
                let _i = y * width + x                  // Index of the pixel in the output.

                let i = _i * 4                          // Index of the pixel in the original RGB image.
                let j = ( ( y + 1 ) * width + x ) * 4   // Index of the y-successor.
                let k = ( y * width + x + 1 ) * 4       // Index of the x-successor.

                // Detail at a pixel is defined as the square of the change in the successor pixel.
                // This is calculated and added per RGB channel and per axis.
                for ( let c = 0; c < 3; c++ ) {
                    if ( y < height - 1 )
                        sum += ( pixels[ i + c ] - pixels[ j + c ] ) ** 2
                    if ( x < width - 1 )
                        sum += ( pixels[ i + c ] - pixels[ k + c ] ) ** 2
                }

                this.detail[ _i ] = sum
            }
        }

        // Now sum in the column direction to get cumulative detail in the box ((0, 0), (x, y)).
        for ( let x = 0; x < width; x++ ) {
            let sum = 0
            for ( let y = 0; y < height; y++ ) {
                let i = y * width + x
                sum += this.detail[ i ]
                this.detail[ i ] = sum
            }
        }
    }

    // Cumulative detail in the box ((0, 0), (x, y))
    getCumulativeDetail( x, y ) {
        x = Math.max( 0, Math.min( x, width - 1 ) )
        y = Math.max( 0, Math.min( y, height - 1 ) )
        return this.detail[ y * width + x ]
    }

    detailInBox( x, y, r ) {
        return this.getCumulativeDetail( x + r, y + r )
            - this.getCumulativeDetail( x - r, y + r )
            - this.getCumulativeDetail( x + r, y - r )
            + this.getCumulativeDetail( x - r, y - r )
    }
}
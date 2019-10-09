class DetailInfo {
    constructor(imageData, options) {
        // let pixels = imageData.data
        let pixels = DetailInfo.blurred(imageData, options.blur)
        let { height, width } = imageData

        this.detail = new Uint32Array(width * height)
        this.width = width
        this.height = height

        let exponent = { quadratic: 2, linear: 1 }[options.gradientFunction]
        console.log({ exponent })

        // Calculate cumulative detail for each row.
        for (let y = 0; y < height; y++) {
            let sum = 0
            for (let x = 0; x < width; x++) {
                let _i = xyToIndex(x, y, width)           // Index of the pixel in the output.

                let i = _i * 4                              // Index of the pixel in the original RGB image.
                let j = xyToIndex(x, y + 1, width) * 4    // Index of the y-successor.
                let k = xyToIndex(x + 1, y, width) * 4    // Index of the x-successor.

                // Detail at a pixel is defined as the square of the change in the successor pixel.
                // This is calculated and added per RGB channel and per axis.
                for (let c = 0; c < 3; c++) {
                    if (y < height - 1)
                        sum += Math.abs(pixels[i + c] - pixels[j + c]) ** exponent
                    if (x < width - 1)
                        sum += Math.abs(pixels[i + c] - pixels[k + c]) ** exponent
                }

                this.detail[_i] = sum
            }
        }

        // Now sum in the column direction to get cumulative detail in the box ((0, 0), (x, y)).
        for (let x = 0; x < width; x++) {
            let sum = 0
            for (let y = 0; y < height; y++) {
                let i = xyToIndex(x, y, width)
                sum += this.detail[i]
                this.detail[i] = sum
            }
        }
    }

    static blurred(imageData, options) {
        let { blurWidth, blurPasses } = options
        let pixels = imageData.data

        if (blurPasses == 0)
            return pixels

        let xPass = pixels.slice(0)
        let { height, width } = imageData
        let halfWidth = Math.floor(blurWidth / 2)

        for (let pass = 0; pass < blurPasses; pass++) {
            for (let y = 0; y < height; y++) {
                let sums = [0, 0, 0]
                for (let x = 0; x < width + halfWidth; x++) {
                    let xStart = x - blurWidth
                    let xMid = x - halfWidth
                    for (let c = 0; c < 3; c++) {
                        if (x < width)
                            sums[c] += pixels[xyToIndex(x, y, width) * 4 + c]
                        if (xStart >= 0)
                            sums[c] -= pixels[xyToIndex(xStart, y, width) * 4 + c]
                        if (xMid >= 0)
                            xPass[xyToIndex(xMid, y, width) * 4 + c] = sums[c] / blurWidth
                    }
                }
            }
        }

        let result = xPass.slice(0)
        for (let pass = 0; pass < blurPasses; pass++) {
            for (let x = 0; x < width; x++) {
                let sums = [0, 0, 0]
                for (let y = 0; y < height + halfWidth; y++) {
                    let yStart = y - blurWidth
                    let yMid = y - halfWidth
                    for (let c = 0; c < 3; c++) {
                        if (y < height)
                            sums[c] += xPass[xyToIndex(x, y, width) * 4 + c]
                        if (yStart >= 0)
                            sums[c] -= xPass[xyToIndex(x, yStart, width) * 4 + c]
                        if (yMid >= 0)
                            result[xyToIndex(x, yMid, width) * 4 + c] = sums[c] / blurWidth
                    }
                }
            }
        }

        // for ( let i = 0; i < pixels.length; i++ )
        //     pixels[ i ] = result[ i ]
        // canvas.getContext( "2d" ).putImageData( imageData, 0, 0 )
        // debugger

        return result
    }

    // Cumulative detail in the box ((0, 0), (x, y))
    getCumulativeDetail(x, y) {
        x = Math.max(0, Math.min(x, this.width - 1))
        y = Math.max(0, Math.min(y, this.height - 1))
        return this.detail[y * this.width + x]
    }

    detailInBox(x, y, r) {
        return this.getCumulativeDetail(x + r, y + r)
            - this.getCumulativeDetail(x - r, y + r)
            - this.getCumulativeDetail(x + r, y - r)
            + this.getCumulativeDetail(x - r, y - r)
    }

    detailInRect(x0, y0, x1, y1) {
        return this.getCumulativeDetail(x1, y1)
            - this.getCumulativeDetail(x0, y1)
            - this.getCumulativeDetail(x1, y0)
            + this.getCumulativeDetail(x0, y0)
    }
}
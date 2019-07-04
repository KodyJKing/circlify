{
    const request = require( "request" )
    const express = require( "express" )

    const app = express()
    const port = 8080

    const imageUrl = "https://image3.mouthshut.com/images/imagesp/925016986s.jpg"
    // const imageUrl = "https://cdn-images-1.medium.com/max/1600/1*ZbsHMqU7Sca96m9ctMWQIg.jpeg"

    app.set( "etag", false )

    app.get( "/img", ( req, res ) => {
        request.get( imageUrl )
            .on( "response", newRes => {
                newRes.headers[ "Cache-Control" ] = "no-cache"
            } )
            .pipe( res )
    } )

    app.use( express.static( "src/www" ) )

    app.listen( port, () => console.log( "App listening on port " + port ) )
}
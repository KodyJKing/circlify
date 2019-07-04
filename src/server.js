{
    const request = require( "request" )
    const express = require( "express" )

    const app = express()
    const port = 8080

    const imageUrl = "https://image3.mouthshut.com/images/imagesp/925016986s.jpg"

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
{
    const request = require( "request" )
    const express = require( "express" )

    const app = express()
    const port = 8080

    // const imageUrl = "https://image3.mouthshut.com/images/imagesp/925016986s.jpg"
    // const imageUrl = "https://c402277.ssl.cf1.rackcdn.com/photos/907/images/hero_small/sumatran-tiger-hero_92514619.jpg?1345581518"
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"

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
function processAccessToken( accessToken, refreshToken, accessTokenExpiration ) {
    console.log( "           Access token : " + accessToken );
    console.log( "          Refresh token : " + refreshToken );
    console.log( "Access token expiration : " + accessTokenExpiration );

    // Set the cookie 
    /*
    document.cookie = "FGA_ACCESS_TOKEN=" + accessToken;

    console.log( "FGA_ACCESS_TOKEN cookie set" );
    */
}

function cleanUpUrl() {
}


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const hasAccessToken    = urlParams.has( "access_token" );
const hasRefreshToken   = urlParams.has( "refresh_token" );
const hasExpirationDate = urlParams.has( "access_token_expiration" );

if ( hasAccessToken && hasRefreshToken && hasExpirationDate ) {
    processAuthTokens( urlParams.get("access_token"),
        urlParams.get("refresh_token"), 
        urlParams.get("access_token_expiration") );
    cleanUpUrl();
}

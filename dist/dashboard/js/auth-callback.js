function processAuthTokens( accessToken, refreshToken, accessTokenExpiration ) {
    /*
    console.log( "           Access token : " + accessToken );
    console.log( "          Refresh token : " + refreshToken );
    console.log( "Access token expiration : " + accessTokenExpiration );
    */

    // Set browser cookies
    document.cookie = "LETSVAL_ACCESS_TOKEN=" + accessToken;
    document.cookie = "LETSVAL_REFRESH_TOKEN=" + refreshToken;
    document.cookie = "LETSVAL_TOKEN_EXPIRATION=" + accessTokenExpiration;

    console.log( "Auth cookies set" );
}

function cleanUpUrl() {
    // Overwrite the URL to remove all the code stuff
    history.replaceState(null, null, "https://letsvalidate.org/dashboard" );

    console.log( "URL rewritten to remove tokens now that they are stored in cookies" );
}


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const hasAccessToken    = urlParams.has( "access_token" );
const hasRefreshToken   = urlParams.has( "refresh_token" );
const hasExpirationDate = urlParams.has( "access_token_expiration" );

if ( hasAccessToken && hasRefreshToken && hasExpirationDate ) {
    processAuthTokens( 
        urlParams.get("access_token"),
        urlParams.get("refresh_token"), 
        urlParams.get("access_token_expiration") );
    cleanUpUrl();
}

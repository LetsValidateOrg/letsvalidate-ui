function getCookie( cookieName ) {
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function getAccessToken() {
    const accessToken = getCookie( "LETSVAL_ACCESS_TOKEN" );
    //console.log( "Access token: " + accessToken );
    return accessToken;
}

function redirectToLogin() {
    window.location = "https://letsvalidate.auth.us-east-2.amazoncognito.com/login?client_id=rme10ok7gdr32r7qgoei8tocv&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2F24u4ki7bie.execute-api.us-east-2.amazonaws.com%2Foauth%2Fcallback";
}

if ( getAccessToken() === null ) {
    // This bro needs to log in
    redirectToLogin();
} 
const expireTime = getCookie("LETSVAL_TOKEN_EXPIRATION");

// If we don't know when it expires, assume it expired
if ( expireTime === null ) {
    redirectToLogin();
}

const currentDate = new Date();

console.log( "   Current time: " + currentDate.toISOString() );

const expireDate = new Date( expireTime );

console.log( "Expiration time: " + expireDate.toISOString() );

const secondsDelta = (expireDate - currentDate) / 1000;

// If we are within 10 minutes of expiration, go ahead and use the 
//      refresh token to go another token
const tenMinutesInSeconds = 60 * 10;
if ( secondsDelta < tenMinutesInSeconds ) {
    console.log("TODO: Need to refresh token, we're close to expired or expired" );
} else {
    const minutesRemaining = int(secondsDelta / 60);
    console.log("Do not need to refresh token; still valid for " + 
        minutesRemaining + " minutes" );
}

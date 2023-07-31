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
    console.log( "Access token: " + accessToken );
    return accessToken;
}

if getAccessToken() === null {
    // This bro needs to log in
    window.location = "https://letsvalidate.auth.us-east-2.amazoncognito.com/login?client_id=rme10ok7gdr32r7qgoei8tocv&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2F24u4ki7bie.execute-api.us-east-2.amazonaws.com%2Foauth%2Fcallback";
} else {
    console.log("Found access token cookie. TODO: check current time vs token expiration");
}

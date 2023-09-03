function showAuthCookie() {
    const authCookie = getAccessToken();
    let preElement = document.getElementById("pre_auth_token_contents");
    preElement.appendChild( document.createTextNode(authCookie) );
}

showAuthCookie();

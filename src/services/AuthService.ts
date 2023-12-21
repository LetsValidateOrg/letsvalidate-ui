import { hostedLoginUrls } from "@/models/HostedUrls";

export const CognitoHostedLoginUrl = hostedLoginUrls[
  window.location.hostname
] as string;


export const AuthService = {
  getCookie(cookieName: string): any {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },
  deleteCookie( name:string, value:string | null ): void {
    // Set expiration to the dawn of time AKA 1970
    // this clears out the cookie
    if( this.getCookie( name ) ) {
      document.cookie = `${name}=${value}; expires = Thu, 01 Jan 1970 00:00:00 GMT`
    }
  },
  signOut(){
    const accessToken = this.getCookie("LETSVAL_ACCESS_TOKEN");
    const expireTime = this.getCookie("LETSVAL_TOKEN_EXPIRATION");
    
    window.location.href = CognitoHostedLoginUrl;
  },
  getAccessToken(): string | null {
    return this.getCookie("LETSVAL_ACCESS_TOKEN");
  },
  authStatusLoggedIn(): boolean {
    this.processUrlParams();
    const accessToken = this.getAccessToken();
    const expireTime = this.getCookie("LETSVAL_TOKEN_EXPIRATION");

    if (expireTime !== null) {
      const currentDate = new Date();
      const timeLeft = new Date(expireTime).getTime() - currentDate.getTime();

      //TODO Replace logic with refresh logic in future
      if (timeLeft && timeLeft <= 0) {
        this.deleteCookie("LETSVAL_TOKEN_EXPIRATION", expireTime)
        this.deleteCookie("LETSVAL_ACCESS_TOKEN", accessToken)
        return false
      }
    }
    return accessToken !== null;
  },

  processAuthTokens( accessToken: string | null, refreshToken: string | null, accessTokenExpiration: string | null) {
    // Set browser cookies
    document.cookie = "LETSVAL_ACCESS_TOKEN=" + accessToken;
    document.cookie = "LETSVAL_REFRESH_TOKEN=" + refreshToken;
    document.cookie = "LETSVAL_TOKEN_EXPIRATION=" + accessTokenExpiration;
  },
  processUrlParams (){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const hasAccessToken    = urlParams.has( "access_token" );
    const hasRefreshToken   = urlParams.has( "refresh_token" );
    const hasExpirationDate = urlParams.has( "access_token_expiration" );

    if ( hasAccessToken && hasRefreshToken && hasExpirationDate ) {
        this.processAuthTokens( 
            urlParams.get("access_token"),
            urlParams.get("refresh_token"), 
            urlParams.get("access_token_expiration") );
    }
  }
};

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
  getAccessToken(): string | null {
    return this.getCookie("LETSVAL_ACCESS_TOKEN");
  },
  authStatusLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    const expireTime = this.getCookie("LETSVAL_TOKEN_EXPIRATION");

    //Only refresh the token if the user has an expiration cookie set
    if (expireTime !== null) {
      const currentDate = new Date();
      const secondsDelta = expireTime
        ? (new Date(expireTime).getTime() - currentDate.getTime()) / 1000
        : 0;

      // If we are within 10 minutes of expiration, go ahead and use the
      //      refresh token to go another token
      const tenMinutesInSeconds = 60 * 10;
      if (secondsDelta < tenMinutesInSeconds) {
        console.log(
          "TODO: Need to refresh token, we're close to expired or expired",
        );
      } else {
        const minutesRemaining = Math.trunc(secondsDelta / 60);
        console.log(
          "Access token still valid for " + minutesRemaining + " minutes",
        );
      }
    }
    return expireTime !== null && accessToken !== null;
  },
};

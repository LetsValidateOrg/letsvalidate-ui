import { AuthService } from "./AuthService";
import type { MonitoredCertificateResponse } from "../models/MonitorCertificates";

const getMonitoredCertsEndpoint =
  "https://letsvalidate-webui-api.publicntp.workers.dev/api/v001/monitors";
const monitoredUrlApiEndpoint =
  "https://wvyfbi1fnf.execute-api.us-east-2.amazonaws.com/api/v001/monitors";

export const MonitorService = {
  async addNewMonitorUrl(
    url: string,
    port: number,
  ): Promise<MonitoredCertificateResponse | null> {
    const accessToken = AuthService.getAccessToken();
    if (!accessToken) {
      return null;
    }
    let fullUrl = "https://" + scrubHostnameOrIp(url);

    if (port != 443) {
      fullUrl = fullUrl + ":" + port;
    }

    const fetchResponse = await fetch(monitoredUrlApiEndpoint, {
      headers: {
        Authorization: accessToken,
      },
      body: JSON.stringify({ url: fullUrl }),
      method: "POST",
    });
    let response = {} as MonitoredCertificateResponse;

    // If there's a 200, read the body
    if (fetchResponse.status === 200) {
      response = await fetchResponse.json();
      const bodyString = JSON.stringify(response);

      // Is this authoritative data? (it should be -- it's from backend infra)
      const isAuthoritativeData = response["metadata"]["authoritative_data"];
      if (isAuthoritativeData === true) {
        // Flip the authoritative data to false as we're adding this to the cache
        const tempState = JSON.parse(bodyString);
        tempState["metadata"]["authoritative_data"] = false;

        // base64 encode the JSON to make it (slightly) opaque -- users shouldn't know or care
        const opaqueStateValue = btoa(JSON.stringify(tempState));

        // Update our state cookie with this info and cache it for max of 3 minutes.
        //      Worker KV *should* become updated with this same data within 60 seconds,
        //      but let's add three times that long to be uber safe. If it hasn't hit worker KV by then,
        //      something is horribly wrong
        const millisecondsPerSecond = 1000;
        const secondsPerMinute = 60;
        const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
        const expirationDate = new Date(Date.now() + 3 * millisecondsPerMinute);
        const expirationSuffix = "; expires=" + expirationDate.toUTCString();
        document.cookie =
          "LETSVAL_USER_STATE_CACHE=" + opaqueStateValue + expirationSuffix;
        console.log(
          "Stored authoritative state in temp browser cookie until Workers KV becomes synchronized",
        );
      } else {
        console.log(
          "WARNING: data coming back from backend infra is not marked authoritative",
        );
      }
    } else if (fetchResponse.status === 204) {
      console.log(
        "This user was already monitoring this site, nothing to do here",
      );
    } else if (fetchResponse.ok === false) {
      console.log("Got an non-200 response back from API endpoint");
    } else {
      console.log("Unknown response status: " + fetchResponse.status);
    }
    return response as MonitoredCertificateResponse;
  },
  async getMonitoredCerts(): Promise<MonitoredCertificateResponse> {
    let response = {} as MonitoredCertificateResponse;

    const fetchResponse = await fetch(getMonitoredCertsEndpoint, {
      headers: { Authorization: "Bearer " + AuthService.getAccessToken() },
      method: "GET",
    });

    if (fetchResponse.ok) {
      const monitoredCerts = await fetchResponse.json();
      // Let's see if we have cached data in our browser cookies
      const cachedBrowserStateString = AuthService.getCookie(
        "LETSVAL_USER_STATE_CACHE",
      );
      response = monitoredCerts;
      if (cachedBrowserStateString !== null) {
        // "De-obfuscate" it and turn it into a legit JS object
        const browserCachedState = JSON.parse(atob(cachedBrowserStateString));

        // Check the timestamp of the two sets of data. If what we got from the API matches our
        //      browser time, Worker KV caught up (at least at our Cloudflare edge location)
        //      and we can delete the cookie with cached state.
        //
        // Note that date strings are always stored in ISO 8601 format, so we can do a simple
        //      string lexicographical comparison, no need to turn them into real date objects
        const apiDataTimestamp = monitoredCerts["metadata"]["data_timestamp"];
        const browserCacheDataTimestamp =
          browserCachedState["metadata"]["data_timestamp"];
        /*
            console.log("          Data timestamp (API) : " + apiDataTimestamp);
            console.log("Data timestamp (browser cache) : " + browserCacheDataTimestamp );
            */
        if (apiDataTimestamp >= browserCacheDataTimestamp) {
          // Set the expiration time to the epoch to force browser to delete
          document.cookie =
            "LETSVAL_USER_STATE_CACHE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          console.log(
            "Deleted browser cookie with cached state as API data has become consistent",
          );
        } else {
          // Cached state is still newer, so use that data
          response = browserCachedState;
          console.log(
            "Retaining browser state cache as that data is more recent than Cloudflare's cached data",
          );
        }
      }

      return response as MonitoredCertificateResponse;
    } else {
      console.log("Got non-200 response for monitored certs");

      // See if we have cached data we can display
      const cachedBrowserStateString = AuthService.getCookie(
        "LETSVAL_USER_STATE_CACHE",
      );
      if (cachedBrowserStateString !== null) {
        console.log("Browser cookie has cached state, so let's show that");
        const browserCachedState = JSON.parse(atob(cachedBrowserStateString));
        browserCachedState["metadata"]["browser_cached_state"] = true;
        return browserCachedState;
      }
    }
    return response as MonitoredCertificateResponse;
  },
  async removeMonitor(
    monitorIdToCancel: string,
  ): Promise<MonitoredCertificateResponse | null> {
    const accessToken = AuthService.getAccessToken();
    if (!accessToken) {
      return null;
    }

    const constructedRequestUrl =
      monitoredUrlApiEndpoint + "/" + monitorIdToCancel;

    const fetchResponse = await fetch(constructedRequestUrl, {
      headers: {
        Authorization: accessToken,
      },
      method: "DELETE",
    });

    let response = {} as MonitoredCertificateResponse;

    // If there's a 200, read the body
    if (fetchResponse.status === 200) {
      response = await fetchResponse.json();

      const isAuthoritativeData = response["metadata"]["authoritative_data"];
      if (isAuthoritativeData === true) {
        // Flip the authoritative data to false as we're adding this to the cache
        const tempState = response;
        tempState["metadata"]["authoritative_data"] = false;

        // base64 encode the JSON to make it (slightly) opaque -- users shouldn't know or care
        const opaqueStateValue = btoa(JSON.stringify(tempState));

        // Update our state cookie with this info and cache it for max of 3 minutes.
        //      Worker KV *should* become updated with this same data within 60 seconds,
        //      but let's add three times that long to be uber safe. If it hasn't hit worker KV by then,
        //      something is horribly wrong
        const millisecondsPerSecond = 1000;
        const secondsPerMinute = 60;
        const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
        const expirationDate = new Date(Date.now() + 3 * millisecondsPerMinute);
        const expirationSuffix = "; expires=" + expirationDate.toUTCString();
        document.cookie =
          "LETSVAL_USER_STATE_CACHE=" + opaqueStateValue + expirationSuffix;
        console.log(
          "Stored authoritative state in temp browser cookie until Workers KV becomes synchronized",
        );

        // Check cookie value
        /*
            const cookieCheckValue = getCookie( "LETSVAL_USER_STATE_CACHE" );
            if ( cookieCheckValue === null ) {
                console.log("ERROR: did not retrieve cookie immediately after setting it");
            } else {
                console.log("Browser cookie state: " + cookieCheckValue);
            }
            */
      } else {
        console.log(
          "WARNING: data coming back from backend infra is not marked authoritative",
        );
      }
      return response;
    } else if (fetchResponse.ok === false) {
      console.log("Got an non-200 response back from API endpoint");
    } else {
      console.log("Unknown response status: " + fetchResponse.status);
    }
    return response;
  },
};

function scrubHostnameOrIp(url: string): string {
  // Strip prefixes we don't allow/need
  const prefixesToRemove: string[] = ["http://", "https://"];
  for (const currPrefix of prefixesToRemove) {
    if (url.startsWith(currPrefix)) {
      url = url.substring(currPrefix.length);
      console.log(
        'Found prefix to remove "' +
          currPrefix +
          '", after removing it have "' +
          url +
          '"',
      );
    }
  }

  return url;
}

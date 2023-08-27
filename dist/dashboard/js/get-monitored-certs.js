let certsRetrieved = false;
let monitoredCerts = {};

// https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
// https://gist.github.com/mrienstra/8aa4eeeeab2012d2aa8ffc7f5e45f280




async function requestMonitoredCerts() {
    const startTime = Date.now();

    const getMonitoredCertsEndpoint = "https://letsvalidate-webui-api.publicntp.workers.dev/api/v001/monitored-certificates";

    const fetchResponse = await fetch( getMonitoredCertsEndpoint,
        {
            headers : { 'Authorization': 'Bearer ' + getAccessToken() },
            method  : "GET",
        }
    );

    const endTime = Date.now();

    const fetchTimeInMs = endTime - startTime;

    console.log("Got response to request for monitored certs in " + fetchTimeInMs + " ms");
    if ( fetchResponse.ok ) {
        console.log("Got 200-something response from monitored certs request");
        monitoredCerts = await fetchResponse.json();
        //console.log( JSON.stringify(jsonBody, null, 2) );

        // Let's see if we have cached data in our browser cookies
        const cachedBrowserStateString  = getCookie( "LETSVAL_USER_STATE_CACHE" );
        let dataToDisplay = monitoredCerts;
        if ( cachedBrowserStateString !== null ) {
            // "De-obfuscate" it and turn it into a legit JS object
            const browserCachedState = JSON.parse( atob(cachedBrowserStateString) );

            // Check the timestamp of the two sets of data. If what we got from the API matches our 
            //      browser time, Worker KV caught up (at least at our Cloudflare edge location)
            //      and we can delete the cookie with cached state.
            //      
            // Note that date strings are always stored in ISO 8601 format, so we can do a simple
            //      string lexicographical comparison, no need to turn them into real date objects
            const apiDataTimestamp          = monitoredCerts['metadata']['data_timestamp'];
            const browserCacheDataTimestamp = browserCachedState['metadata']['data_timestamp'];
            /*
            console.log("          Data timestamp (API) : " + apiDataTimestamp);
            console.log("Data timestamp (browser cache) : " + browserCacheDataTimestamp );
            */
            if ( apiDataTimestamp >= browserCacheDataTimestamp ) {
                // Set the expiration time to the epoch to force browser to delete
                document.cookie = "LETSVAL_USER_STATE_CACHE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                console.log("Deleted browser cookie with cached state as API data has become consistent");
            } else {
                // Cached state is still newer, so use that data
                dataToDisplay = browserCachedState;
                dataToDisplay['metadata']['browser_cached_state'] = true;
                console.log("Retaining browser state cache as that data is newer than API data");
            }
        }

        // Show the new data
        displayNewMonitorData( dataToDisplay );
        
    } else {
        console.log("Got non-200 response for monitored certs");

        // See if we have cached data we can display
        const cachedBrowserStateString  = getCookie( "LETSVAL_USER_STATE_CACHE" );
        if ( cachedBrowserStateString !== null ) {
            console.log("Browser cookie has cached state, so let's show that");
            const browserCachedState = JSON.parse( atob(cachedBrowserStateString) );    
            browserCachedState['metadata']['browser_cached_state'] = true;
            displayNewMonitorData( browserCachedState );
        }
    }
}

requestMonitoredCerts();

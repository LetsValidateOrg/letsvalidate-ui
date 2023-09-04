async function handleCancelUserMonitor(monitorIdToCancel) {
    console.log("User requested to stop monitoring a certificate, monitor ID: " + monitorIdToCancel);

    return;

    const constructedRequestUrl = monitoredUrlApiEndpoint + "?" + new URLSearchParams(
        {
            monitor_id : monitorIdToCancel
        }
    );

    const accessToken = getAccessToken();

    const startTime = Date.now();

    const fetchResponse = await fetch( constructedRequestUrl,
        {
            headers: {
                "Authorization": accessToken
            },

            method: "DELETE"
        });

    const endTime = Date.now();

    const fetchTimeInMs = endTime - startTime;

    console.log("API endpoint response took " + fetchTimeInMs + " ms");

    // If there's a 200, read the body
    if ( fetchResponse.status === 200 ) {
        const jsonBody = await fetchResponse.json();

        // Get string version
        const jsonStateString = JSON.stringify(jsonBody);
        //console.log("Got response:\n" + jsonStateString );

        const dataTimestampString = jsonBody['metadata']['data_timestamp'];
        const dataTimestamp = new Date(dataTimestampString);
        //console.log("Data timestamp from backend infra (AWS): " + dataTimestampString );

        displayNewMonitorData( jsonBody );
 
        // Is this authoritative data? (it should be -- it's from backend infra)
        const isAuthoritativeData = jsonBody['metadata']['authoritative_data'];
        if ( isAuthoritativeData === true ) {
            // Flip the authoritative data to false as we're adding this to the cache
            let tempState = JSON.parse(jsonStateString);
            tempState['metadata']['authoritative_data'] = false;

            // base64 encode the JSON to make it (slightly) opaque -- users shouldn't know or care
            const opaqueStateValue = btoa(JSON.stringify(tempState));

            // Update our state cookie with this info and cache it for max of 3 minutes.
            //      Worker KV *should* become updated with this same data within 60 seconds,
            //      but let's add three times that long to be uber safe. If it hasn't hit worker KV by then,
            //      something is horribly wrong
            const millisecondsPerSecond = 1000;
            const secondsPerMinute = 60;
            const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
            const expirationDate = new Date(Date.now() + (3 * millisecondsPerMinute) );
            const expirationSuffix = "; expires=" + expirationDate.toUTCString();
            document.cookie = "LETSVAL_USER_STATE_CACHE=" + opaqueStateValue + expirationSuffix;
            console.log("Stored authoritative state in temp browser cookie until Workers KV becomes synchronized");

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
            console.log("WARNING: data coming back from backend infra is not marked authoritative");
        }
    } else if ( fetchResponse.ok === false ) {
        console.log("Got an non-200 response back from API endpoint");
    } else {
        console.log("Unknown response status: " + fetchResponse.status );
    }
}

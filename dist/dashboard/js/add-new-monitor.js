const monitoredUrlApiEndpoint = "https://wvyfbi1fnf.execute-api.us-east-2.amazonaws.com/api/v001/monitor";

function clearResetAddMonitor() {
    let hostnameInput   = document.getElementById("input_new_monitor_url");
    let portInput       = document.getElementById("input_new_monitor_port");
    let monitorButton   = document.getElementById("button_add_new_monitor");

    hostnameInput.value = "";
    portInput.value = "443";
    hostnameInput.disabled  = false;
    portInput.disabled      = false;
    monitorButton.disabled  = false;
}


function scrubHostnameOrIp() {
    // Trim leading/trailing whitespace
    let scrubbedHostnameOrIp = document.getElementById("input_new_monitor_url").value.trim();

    // Strip prefixes we don't allow/need
    const prefixesToRemove = ["http://", "https://"];
    for ( currPrefix of prefixesToRemove ) {
        if ( scrubbedHostnameOrIp.startsWith(currPrefix) ) {
            scrubbedHostnameOrIp = scrubbedHostnameOrIp.substring(currPrefix.length);
            console.log("Found prefix to remove \"" + currPrefix + 
                "\", after removing it have \"" + scrubbedHostnameOrIp + "\"" );
        }
    } 

    return scrubbedHostnameOrIp;
}

async function addNewMonitorUrl() {
    const scrubbedHost = scrubHostnameOrIp();

    // Update the input field and disable both it and the add button
    document.getElementById("input_new_monitor_url").value = scrubbedHost;
    document.getElementById("input_new_monitor_url").disabled = true;
    document.getElementById("input_new_monitor_port").disabled = true;
    document.getElementById("button_add_new_monitor").disabled = true;

    let fullUrl = "https://" + scrubbedHost;

    const portNumber = parseInt(document.getElementById("input_new_monitor_port").value);

    if ( portNumber != 443 ) {
        fullUrl = fullUrl + ":" + portNumber;
    }

    console.log("Going to submit URL \"" + fullUrl + "\" to backend API" );

    const constructedRequestUrl = monitoredUrlApiEndpoint;
    
    //console.log("Constructed URL: " + constructedRequestUrl);

    const accessToken = getAccessToken();

    const startTime = Date.now();

    const fetchResponse = await fetch( constructedRequestUrl,
        {
            headers: {
                "Authorization": accessToken
            },

            body: JSON.stringify( { url: fullUrl } )

            method: "POST"
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
    } else if ( fetchResponse.status === 204 ) {
        console.log("This user was already monitoring this site, nothing to do here");
    } else if ( fetchResponse.ok === false ) {
        console.log("Got an non-200 response back from API endpoint");
    } else {
        console.log("Unknown response status: " + fetchResponse.status );
    }

    // Clear out form data and get it ready again
    clearResetAddMonitor();
}

function checkAddNewUrlInputActions() {
    // Check for events that affect the submit button
    const newUrlText = document.getElementById("input_new_monitor_url").value;

    const isButtonDisabled = document.getElementById("button_add_new_monitor").disabled;

    /**
     * Needs all to be true:
     *      - 5+ characters
     *      - At least 1 of the characters is a period
     *      - No periods in final two characters
     */
    const finalTwoCharacters = newUrlText.substring(newUrlText.length - 2)
    //console.log("Final two characters: " + finalTwoCharacters);
    const newTextIsValidUrl = (
        (newUrlText.length >= 5) && 
        (newUrlText.includes(".") === true) &&
        (finalTwoCharacters.includes(".") === false)
    );

    // If we have a valid URL, then check if port number is valid
    const portNumber = parseInt(document.getElementById("input_new_monitor_port").value);

    const isValidPortNumber = ((portNumber >= 1) && (portNumber <= 65535));

    // if the button is currently disabled, see if we can enable it
    if ( 
        (isButtonDisabled === true) && 
        (newTextIsValidUrl === true) &&
        (isValidPortNumber === true) 
    ) {
        document.getElementById("button_add_new_monitor").disabled = false;
    }

    // if the button is currently enabled, let's see if we should disable it
    else if ( 
        (isButtonDisabled === false) && 
        ((newTextIsValidUrl === false) ||
        (isValidPortNumber === false))
    ) {
        document.getElementById("button_add_new_monitor").disabled = true; 
    }
}

function sanityCheckPortNumberField() {
    let portNumber = document.getElementById("input_new_monitor_port").value;

    // Drop anything that's not 0-9
    const allDigits = portNumber.replace(/\D/g,'');

    // Change the value if it's different after we scrub it
    if ( portNumber != allDigits ) {
        document.getElementById("input_new_monitor_port").value = allDigits;
    }

    // See if we need to enable/diable the form button
    checkAddNewUrlInputActions();
}

function createTimeDeltaString(dateComparisonString) {
    const comparisonEpochMilliseconds = new Date(dateComparisonString).getTime();

    // Get epoch time now
    const currentEpochMilliseconds = Date.now();

    // secondsDelta
    const secondsDelta = Math.floor((comparisonEpochMilliseconds - currentEpochMilliseconds) / 1000);
    /*
    console.log("Current epoch ms: " + currentEpochMilliseconds);
    console.log("comparison epoch ms: " + comparisonEpochMilliseconds);

    console.log("Seconds delta between current of " + new Date().toUTCString() + " and comparision " + 
        dateComparisonString + ": " + secondsDelta);
    */

    // Find out if we're in the range where we should return hours (-24 hours to +24 hours)
    let displayValue = null;
    if ( (secondsDelta >= -3600) && (secondsDelta < 3600) ) {
        displayValue = Math.round( Math.abs(secondsDelta / 60) );
        displayUnit = "minutes";
    }
    else if ( (secondsDelta >= -86400) && (secondsDelta <= 86400) ) {
        displayValue = Math.round( Math.abs(secondsDelta / 3600) ); 
        displayUnit = "hours";
    } else {
        displayValue = Math.round( Math.abs(secondsDelta / 86400) );
        displayUnit = "days";
    }

    let displayString = null;
    if ( secondsDelta < 0 ) {
        displayString = displayValue + " " + displayUnit + " ago";
    } else if ( secondsDelta === 0 ) {
        displayString = "(now)";
    } else {
        displayString = displayValue + " " + displayUnit + " from now";
    }

    return displayString;
}

function addEventListeners() {
    document.getElementById("button_add_new_monitor").addEventListener(
        "click", addNewMonitorUrl );
    document.getElementById("input_new_monitor_url").addEventListener(
        "input", checkAddNewUrlInputActions );
    document.getElementById("input_new_monitor_port").addEventListener(
        "input", sanityCheckPortNumberField );
}

addEventListeners();

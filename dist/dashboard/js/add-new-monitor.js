const monitoredUrlApiEndpoint = "https://wvyfbi1fnf.execute-api.us-east-2.amazonaws.com/api/v001/monitored_url";

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

    const constructedRequestUrl = monitoredUrlApiEndpoint + "?" + new URLSearchParams(
        {
            url         : fullUrl
        }
    );

    //console.log("Constructed URL: " + constructedRequestUrl);

    const accessToken = getAccessToken();

    const startTime = Date.now();

    const fetchResponse = await fetch( constructedRequestUrl,
        {
            headers: {
                "Authorization": accessToken
            },

            method: "POST"
        });
    
    const endTime = Date.now();

    const fetchTimeInMs = endTime - startTime;

    console.log("API endpoint response took " + fetchTimeInMs + " ms");

    // If there's a 200, read the body
    if ( fetchResponse.status === 200 ) {
        const jsonBody = await fetchResponse.json();

        /*
        console.log( "JS needs to cache this new data until Worker KV becomes eventually consistent:\n" + 
            JSON.stringify(jsonBody) );
        */

        let tableRef = document.getElementById("table_monitored_certs");

        for ( currRowEntry of jsonBody ) {

            // Create row at bottom of table (-1 signals "bottom")
            let newTableRow = tableRef.insertRow(-1);

            // Create new td's
            let urlCell = newTableRow.insertCell();
            let urlText = document.createTextNode( currRowEntry.url );
            urlCell.appendChild(urlText);

            // empty -- for spacing
            newTableRow.insertCell();

            let expirationCell = newTableRow.insertCell();
            let expirationText = document.createTextNode( createTimeDeltaString(currRowEntry.cert_expires) );
            expirationCell.appendChild( expirationText );

            let lastCheckCell = newTableRow.insertCell();
            let lastCheckText = document.createTextNode( createTimeDeltaString(currRowEntry.last_checked) );
            lastCheckCell.appendChild( lastCheckText );

            // empty -- for spacing
            newTableRow.insertCell();

            let actionViewCell = newTableRow.insertCell();
            actionViewCell.appendChild( document.createTextNode("[view cert details]") );

            let actionDeleteCell = newTableRow.insertCell();
            actionDeleteCell.appendChild( document.createTextNode("[delete monitor]") );
        }

        // Display the table
        tableRef.style.display = "table";
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
    let currentEpochMilliseconds = new Date(dateComparisonString).getTime();

    // Get epoch time now
    const currentDate = Date.now();

    // secondsDelta
    const secondsDelta = Math.floor((currentEpochMilliseconds - currentEpochMilliseconds) / 1000);

    console.log("Seconds delta between current of " + new Date().toUTCString() + " and comparision " + 
        dateComparisonString + ": " + secondsDelta);

    // Find out if we're in the range where we should return hours (-24 hours to +24 hours)
    let displayValue = null;
    if ( (secondsDelta >= -86400) && (secondsDelta <= 86400) ) {
        displayValue = Math.round( Math.abs(secondsDelta / 3600) ); 
        displayUnit = "hours";
    } else {
        displayValue = Math.round( Math.abs(secondsDelta / 86400) );
        displayUnit = "days";
    }

    let displayPastFuture = null;
    if ( secondsDelta < 0 ) {
        displayPastFuture = "ago";
    } else {
        displayPastFuture = "from now";
    }

    return displayValue + " " + displayUnit + " " + displayPastFuture;
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

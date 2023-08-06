const monitoredUrlApiEndpoint = "https://wvyfbi1fnf.execute-api.us-east-2.amazonaws.com/api/v001/monitored_url";


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

    console.log("Constructed URL: " + constructedRequestUrl);

    const fetchResponse = await fetch( constructedRequestUrl,
        {
            headers: {
                "Authorization": getAccessToken()
            },

            method: "POST"
        });

    const jsonBody = await fetchResponse.json();

    console.log( "Got the following content back:\n" + JSON.stringify(jsonBody) );
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

function addEventListeners() {
    document.getElementById("button_add_new_monitor").addEventListener(
        "click", addNewMonitorUrl );
    document.getElementById("input_new_monitor_url").addEventListener(
        "input", checkAddNewUrlInputActions );
    document.getElementById("input_new_monitor_port").addEventListener(
        "input", sanityCheckPortNumberField );
}

addEventListeners();

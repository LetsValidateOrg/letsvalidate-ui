function scrubUrl() {
    // Trim leading/trailing whitespace
    let scrubbedUrl = document.getElementById("input_new_monitor_url").value.trim();

    // Strip prefixes we don't allow/need
    const prefixesToRemove = ["http://", "https://"];
    for ( currPrefix of prefixesToRemove ) {
        if ( scrubbedUrl.startsWith(currPrefix) ) {
            scrubbedUrl = scrubbedUrl.substring(currPrefix.length);
            console.log("Found prefix to remove \"" + currPrefix + 
                "\", after removing it have \"" + scrubbedUrl + "\"" );
        }
    } 

    console.log("Returning scrubbed url \"" + scrubbedUrl + "\"" );

    return scrubbedUrl;
}
function addNewMonitorUrl() {
    console.log("Button clicked to add new URL to monitor");

    const scrubbedUrl = scrubUrl();

    // Update the input field and disable both it and the add button
    document.getElementById("input_new_monitor_url").value = scrubbedUrl;
    document.getElementById("input_new_monitor_url").disabled = true;
    document.getElementById("button_add_new_monitor").disabled = true;

    const urlWithPrefix = "https://" + scrubbedUrl;

    console.log("Going to submit URL \"" + urlWithPrefix + 
        "\" to backend API" );
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

function addEventListeners() {
    document.getElementById("button_add_new_monitor").addEventListener(
        "click", addNewMonitorUrl );
    document.getElementById("input_new_monitor_url").addEventListener(
        "input", checkAddNewUrlInputActions );
    document.getElementById("input_new_monitor_port").addEventListener(
        "input", checkAddNewUrlInputActions );
}

addEventListeners();

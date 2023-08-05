function addNewMonitorUrl() {
    console.log("Button clicked to add new URL to monitor");
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
    const finalTwoCharacters = newUrlText.substring(newUrlText.length - 3)
    console.log("Final two characters: " + finalTwoCharacters);
    const newTextIsValidUrl = (
        (newUrlText.length > 5) && 
        (newUrlText.includes(".") === true) &&
        (finalTwoCharacters.includes(".") === false)
    );

    // if the button is currently disabled, see if we can enable it
    if ( (isButtonDisabled === true) && (newTextIsValidUrl === true) ) {
        document.getElementById("button_add_new_monitor").disabled = false;
    }

    // if the button is currently enabled, let's see if we should disable it
    else if ( (isButtonDisabled === false) && (newTextIsValidUrl === false) ) {
        document.getElementById("button_add_new_monitor").disabled = true; 
    }
}

function addEventListeners() {
    document.getElementById("button_add_new_monitor").addEventListener(
        "click", addNewMonitorUrl );
    document.getElementById("input_new_monitor_url").addEventListener(
        "input", checkAddNewUrlInputActions );
}

addEventListeners();

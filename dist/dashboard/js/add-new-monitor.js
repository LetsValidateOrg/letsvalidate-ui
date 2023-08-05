function addNewMonitorUrl() {
    console.log("Button clicked to add new URL to monitor");
}
function addEventListeners() {
    document.getElementById("button_add_new_monitor").addEventListener(
        "click", addNewMonitorUrl );
}

addEventListeners();

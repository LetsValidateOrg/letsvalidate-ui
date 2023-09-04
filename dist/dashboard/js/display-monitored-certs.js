function removeAllCertDataRows() {
    let tablesToClear = [ 
        document.getElementById("table_expiring_certs"),
        document.getElementById("table_monitored_certs")
    ];

    for ( currTable of tablesToClear ) {
        while ( currTable.rows.length > 1 ) {
            // -1 says (last row)
            currTable.deleteRow(-1);
        }
    }
}

function displayNewMonitorData(newMonitorData) {

    console.log("Displaying (potentially) new data");
    console.log(JSON.stringify(newMonitorData));

    const dataTimestampString = newMonitorData['metadata']['data_timestamp'];
    const dataTimestamp = new Date(dataTimestampString);
    const datacenterInfo = newMonitorData['metadata']['api_endpoint']['datacenter_iata_code'];
    console.log("Monitor data timestamp from datacenter \"" + datacenterInfo + "\": " + dataTimestampString );

    let authoritativeString = newMonitorData['metadata']['authoritative_data'];
    if ( newMonitorData['metadata']['browser_cached_state'] === true ) {
        authoritativeString = authoritativeString + " (using cached state stored in browser cookie)";
    }
    console.log("Monitor data is authoritative? " + authoritativeString );


    let alertsTableRef      = document.getElementById("table_expiring_certs");
    let monitoredTableRef   = document.getElementById("table_monitored_certs");

    // Hide both tables
    alertsTableRef.style.display        = "none";
    monitoredTableRef.style.display     = "none";

    // Clear out all rows but headers, getting all fresh data
    removeAllCertDataRows();

    for ( currRowEntry of newMonitorData['monitored_certificates'] ) {

        console.log("Processing row: " + JSON.stringify(currRowEntry) );

        // Create row at bottom of proper table (-1 signals "bottom")
        let newTableRow = null;
        if ( 'last_alert' in currRowEntry ) {
            newTableRow = alertsTableRef.insertRow(-1);
        } else {
            newTableRow = monitoredTableRef.insertRow(-1);
        }

        let urlCell = newTableRow.insertCell();
        let urlText = document.createTextNode( currRowEntry.url );
        urlCell.appendChild(urlText);

        // empty -- for spacing
        newTableRow.insertCell();

        let expirationCell = newTableRow.insertCell();
        let expirationText = document.createTextNode( createTimeDeltaString(currRowEntry.cert_expires) );
        expirationCell.classList.add("td_center");
        expirationCell.appendChild( expirationText );

        let lastCheckCell = newTableRow.insertCell();
        let lastCheckText = document.createTextNode( createTimeDeltaString(currRowEntry.last_checked) );
        lastCheckCell.classList.add("td_center");
        lastCheckCell.appendChild( lastCheckText );

        // Do we need to show alerting cells?
        if ( 'last_alert' in currRowEntry ) {
            let lastAlertCell = newTableRow.insertCell();
            lastAlertCell.appendChild( document.createTextNode(createTimeDeltaString(currRowEntry.last_alert)));
            lastAlertCell.classList.add("td_center");

            let mutedCell = newTableRow.insertCell();
            if ( currRowEntry.alert_muted === false ) {
                mutedCell.appendChild( document.createTextNode(
                    createTimeDeltaString(currRowEntry.next_alert)));
            } else {
                // Note the alert is muted currently
                mutedCell.appendChild( document.createTextNode( '[alert muted]' ) );
            }
            mutedCell.classList.add("td_center");

            // Empty before actions
            newTableRow.insertCell();

            if ( currRowEntry.alert_muted === true ) {
                newTableRow.insertCell().appendChild( document.createTextNode("[unmute alert]") );
            } else {
                newTableRow.insertCell().appendChild( document.createTextNode("[mute alert]") );
            }

        } else {
            // have blank cell before actions
            newTableRow.insertCell();
        }

        let actionViewCell = newTableRow.insertCell();
        actionViewCell.classList.add("td_center");
        actionViewCell.appendChild( document.createTextNode("[view cert details]") );

        let actionDeleteCell = newTableRow.insertCell();
        actionDeleteCell.classList.add("td_center");
        let img = new Image();
        img.src = "/dashboard/img/cancel.png";
        img.classList.add( 'img_cancel' );
        img.addEventListener( "click", function() {
            handleCancelUserMonitor(currRowEntry.monitor_id )
        });
        console.log("Added cancel call for monitor " + currRowEntry.monitor_id );
        actionDeleteCell.appendChild( img );
    }

    // Display the tables now that all rows are back in 
    alertsTableRef.style.display        = "table";
    monitoredTableRef.style.display     = "table";
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

// Nothing executed, just defining callback functions that later scripts call

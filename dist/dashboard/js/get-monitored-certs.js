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

        // Show the new data
        displayNewMonitorData( monitoredCerts );
        
    } else {
        console.log("Got non-200 response for monitored certs");
    }
}

requestMonitoredCerts();

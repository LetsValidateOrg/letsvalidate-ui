let certsRetrieved = false;

const uiApiEndpoint = "https://letsvalidate-webui-api.publicntp.workers.dev/api/v001/monitored-certificates";

async function requestMonitoredCerts() {
    const startTime = Date.now();

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
    } else {
        console.log("Got non-200 response for monitored certs");
    }
}

requestMonitoredCerts();

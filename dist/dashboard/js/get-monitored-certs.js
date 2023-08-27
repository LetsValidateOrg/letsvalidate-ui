let certsRetrieved = false;


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
        const jsonBody = await fetchResponse.json();
        console.log( JSON.stringify(jsonBody, null, 2) );
    } else {
        console.log("Got non-200 response for monitored certs");
    }
}

requestMonitoredCerts();

document.getElementById('jsv').innerHTML = 'v2.0.20';
function log(param){
    console.log(param);
}

function testLog() {
    // Validate services UUID entered by user first.
    let optionalServices = ['heart_rate', 'generic_access', 'pulse_oximeter', 'blood_pressure', 'device_information']

    log('Requesting any Bluetooth Device...');
    navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        acceptAllDevices: true,
        optionalServices: optionalServices})
        .then(device => {
            log('Connecting to GATT Server...');
            return device.gatt.connect();
        })
        .then(server => {
            // Note that we could also get all services that match a specific UUID by
            // passing it to getPrimaryServices().
            log('Getting Services...');
            return server.getPrimaryServices();
        })
        .then(services => {
            log('Getting Characteristics...');
            let queue = Promise.resolve();
            services.forEach(service => {
                queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
                    log('> Service: ' + service.uuid);
                    document.getElementById('target4').innerHTML = '> Service: ' + service.uuid;
                    characteristics.forEach(characteristic => {
                        log('>> Characteristic: ' + characteristic.uuid + ' ' +
                            getSupportedProperties(characteristic));
                    });
                }));
            });
            return queue;
        })
        .catch((err)=>{console.log('promise catch: ' + err); document.getElementById('target4').innerHTML = 'promise catch: ' + err});
}

/* Utils */

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}
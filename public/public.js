let chosenHeartRateService = null;

// Going to try and send signals to server backend so that logs can be seen using mobile device
// navigator.bluetooth.requestDevice({
//     filters: [{
//         services: ['heart_rate'],
//     }]
// }).then(device => device.gatt.connect())
//     .then(server => {console.log('post: ' + server);server.getPrimaryService('heart_rate')})
//     .then(service => {
//         chosenHeartRateService = service;
//         return Promise.all([
//             service.getCharacteristic('body_sensor_location')
//                 .then(handleBodySensorLocationCharacteristic),
//             service.getCharacteristic('heart_rate_measurement')
//                 .then(handleHeartRateMeasurementCharacteristic),
//         ]);
//     });

function handleBodySensorLocationCharacteristic(characteristic) {
    if (characteristic === null) {
        // console.log("Unknown sensor location.");
        axios.post('/webtooth/logs', {origin: "handleBodySensorLocationCharacteristic", message: "Unknown sensor location."})
            .then((res)=>{console.log("Unknown sensor location.");})
            .catch((err)=>{console.log(err)});
        return Promise.resolve();
    }
    return characteristic.readValue()
        .then(sensorLocationData => {
            const sensorLocation = sensorLocationData.getUint8(0);
            switch (sensorLocation) {
                case 0: return 'Other';
                case 1: return 'Chest';
                case 2: return 'Wrist';
                case 3: return 'Finger';
                case 4: return 'Hand';
                case 5: return 'Ear Lobe';
                case 6: return 'Foot';
                default: return 'Unknown';
            }
        })
        // .then(location => console.log(location));
        .then(location => {
            axios.post('/webtooth/logs', {origin: "location", message: location})
                .then((res)=>{console.log(location);})
                .catch((err)=>{console.log(err)});
        });
}

function handleHeartRateMeasurementCharacteristic(characteristic) {
    return characteristic.startNotifications()
        .then(char => {
            characteristic.addEventListener('characteristicvaluechanged',
                onHeartRateChanged);
        });
}

function onHeartRateChanged(event) {
    const characteristic = event.target;
    // console.log(parseHeartRate(characteristic.value));
    axios.post('/webtooth/logs', {origin: "onHeartRateChanged", message: parseHeartRate(characteristic.value)})
        .then((res)=>{console.log(parseHeartRate(characteristic.value));})
        .catch((err)=>{console.log(err);});
}

function parseHeartRate(data) {
    const flags = data.getUint8(0);
    const rate16Bits = flags & 0x1;
    const result = {};
    let index = 1;
    if (rate16Bits) {
        result.heartRate = data.getUint16(index, /*littleEndian=*/true);
        index += 2;
    } else {
        result.heartRate = data.getUint8(index);
        index += 1;
    }
    const contactDetected = flags & 0x2;
    const contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
        result.contactDetected = !!contactDetected;
    }
    const energyPresent = flags & 0x8;
    if (energyPresent) {
        result.energyExpended = data.getUint16(index, /*littleEndian=*/true);
        index += 2;
    }
    const rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
        const rrIntervals = [];
        for (; index + 1 < data.byteLength; index += 2) {
            rrIntervals.push(data.getUint16(index, /*littleEndian=*/true));
        }
        result.rrIntervals = rrIntervals;
    }
    return result;
}

function resetEnergyExpended() {
    if (!chosenHeartRateService) {
        return Promise.reject(new Error('No heart rate sensor selected yet.'));
    }
    return chosenHeartRateService.getCharacteristic('heart_rate_control_point')
        .then(controlPoint => {
            const resetEnergyExpended = new Uint8Array([1]);
            return controlPoint.writeValue(resetEnergyExpended);
        });
}

function testLog(){
    axios.post('/webtooth/logs', {origin: "testLog", message: 'This test has been successful'})
        .then((res)=>{console.log(parseHeartRate(characteristic.value));})
        .catch((err)=>{console.log(err);});
    console.log(JSON.stringify(navigator));
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true
        // filters: [{
        //     services: ['heart_rate'],
        // }]
    }).then(device => device.gatt.connect())
        .then(server => {console.log('post: ' + server);server.getPrimaryService('heart_rate')})
        .then(service => {
            chosenHeartRateService = service;
            return Promise.all([
                service.getCharacteristic('body_sensor_location')
                    .then(handleBodySensorLocationCharacteristic),
                service.getCharacteristic('heart_rate_measurement')
                    .then(handleHeartRateMeasurementCharacteristic),
            ]);
        });
}
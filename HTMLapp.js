let chosenHeartRateService = null;

function handleBodySensorLocationCharacteristic(characteristic) {
    if (characteristic === null) {
        document.getElementById('target2').innerHTML = "Unknown sensor location.";
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
        }).then(location => console.log(location));
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
    document.getElementById('target3').innerHTML = "parseHeartRate: " + parseHeartRate(characteristic.value);
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

function testLog(){
    document.getElementById('target1').innerHTML = "Pair Function fired!";
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true
        // filters: [{
        //     services: ['heart_rate'],
        //     // services: ['generic_access']
        // }]
    }).then(device => device.gatt.connect())
        .then(server => { document.getElementById('target4').innerHTML = "server: " + JSON.stringify(server); server.getPrimaryService('heart_rate')})
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
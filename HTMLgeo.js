function testLog(){
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(position => {
            document.getElementById('target1').innerHTML = `position: ${position.coords.latitude}, ${position.coords.longitude}`;
        });
        navigator.getBattery().then(batt => {
            document.getElementById('target2').innerHTML = `Battery info: ${batt.level * 100}`
        });
        navigator.vibrate([300,60,300,60,300,60,300,60,300,60,300,60,300,60,300,60,300]);
        document.getElementById('target3').innerHTML = 'Network Type: ' + navigator.connection.effectiveType;
        document.getElementById('target4').innerHTML = 'connection Strength: ' + navigator.connection.rtt;
    }else{
        document.getElementById('target1').innerHTML = 'No geolocation available';
    }
}
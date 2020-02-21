function testLog(){
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(position => {
            document.getElementById('target1').innerHTML = `position: ${position.coords.latitude}, ${position.coords.longitude}`;
        });
        navigator.getBattery().then(batt => {
            document.getElementById('target2').innerHTML = `Battery info: ${batt.level * 100}`
        });
        navigator.vibrate([300,60,300,60,300,60,300,60,300,60,300,60,300,60,300,60,300]);
        document.getElementById('target3').innerHTML = 'connection: ' + navigator.connection.effectiveType;
    }else{
        document.getElementById('target1').innerHTML = 'No geolocation available';
    }
}
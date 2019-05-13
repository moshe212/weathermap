
'use strict';

const iconsUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

const blueIcon = new L.Icon({
    iconUrl: `${iconsUrl}/marker-icon-2x-blue.png`,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: `${iconsUrl}/marker-icon-2x-red.png`,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DEFAULT_MARKER_ICON = blueIcon;
const markers = new Map();
let mymap = L.map('map').setView([51.505, 1], 1);
let i = 0;
let citys = "";
let selectCity = "";
let selectCityName = "";
let lon = "";
let lat = "";
let lastName = "";
let latA = "";
let lonA = "";
let Now = "";
let obj = {};
let Arr = [];
const Times = new Map();

const cord = [
    ["London",51.505, -0.09],
    ["Jerusalem",31.77, 35.22],
    ["New-York",43,-75.5],
    ["Amsterdam",52.37,4.89],
];

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibW9zaGUyMTIiLCJhIjoiY2p1bWV2ZHR4MDVhdTQ1cHA2cGk3c2czcSJ9.JTu4Cjzwnq7kfI6erLu0Iw'
}).addTo(mymap);

for (i = 0; i < cord.length; i++) {
    addAllMarker(cord[i][0])
}

function addAllMarker(city, icon = DEFAULT_MARKER_ICON) {
    const marker = new L.marker([cord[i][1],cord[i][2]], {title: cord[i][0], icon: icon});
    marker.addTo(mymap);
    markers.set(cord[i][0], marker);
}



function addMarker(city, icon = DEFAULT_MARKER_ICON) {
    const marker = new L.marker([lat,lon], {title: selectCityName, icon: icon});
    marker.addTo(mymap);
    markers.set(selectCityName, marker);
}

function addMarkerAfterRes(city, icon = DEFAULT_MARKER_ICON) {
    const marker = new L.marker([latA,lonA], {title: lastName, icon: icon});
    marker.addTo(mymap);
    markers.set(lastName, marker);
}

function resetMarkers() {
    markers.forEach((marker, city) => {
        if (marker.options.icon !== DEFAULT_MARKER_ICON) {
            lastName = Object.values(marker.options)[0];
            latA = marker._latlng.lat;
            lonA = marker._latlng.lng;
            mymap.removeLayer(marker);
            addMarkerAfterRes(lastName);
        }
    });
}

function markSelectedCity(selectCityName) {
    resetMarkers();
    mymap.removeLayer(markers.get(selectCityName));
    addMarker(selectCityName, redIcon);
}

function search(nameKey, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].selectCityName === nameKey) {
            return i ;
        }
    }
}

function remove(nameKey, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].selectCityName === nameKey) {
            myArray.splice(i, 1);
        }
    }
}

function getWeather(){
    citys = document.querySelector('#citys');
    selectCity = citys.options[citys.selectedIndex].value;
    selectCityName = citys.options[citys.selectedIndex].text;

    Now = new Date().getMinutes()

    if (Times.get(selectCityName)  < Times.get(selectCityName) + 1 ) {
        let i = search(selectCityName, Arr)
        lon = Arr[i].lon;
        lat = Arr[i].lat;

        document.querySelector('#CloudDt').innerHTML = Arr[i].Cloud;
        document.querySelector('#Cloud_descDt').innerHTML = Arr[i].Cloud_desc;
        document.querySelector('#TempDt').innerHTML = Arr[i].Temp;
        document.querySelector('#Wind_degDt').innerHTML = Arr[i].Wind_deg;
        document.querySelector('#Wind_SpeedDt').innerHTML = Arr[i].Wind_Speed;

        markSelectedCity(selectCityName);
        mymap.flyTo([Arr[i].lat, Arr[i].lon], 4);

    }else {
        fetch('http://api.openweathermap.org/data/2.5/weather?id=' + selectCity + '&APPID=a19c19fd5280d915d47622d02121bd1f')
            .then(res => res.json())
            .then(data => {
                lon = Object.entries(data)[0][1].lon;
                lat = Object.entries(data)[0][1].lat;
                const Cloud = Object.entries(data)[1][1][0].main;
                const Cloud_desc = Object.entries(data)[1][1][0].description;
                const Temp = Object.entries(data)[3][1].temp;
                const Wind_deg = Object.entries(data)[5][1].deg;
                const Wind_Speed = Object.entries(data)[5][1].speed;

                obj = {selectCityName, Cloud, Cloud_desc, Temp, Wind_deg, Wind_Speed, lat, lon};

                remove(selectCityName, Arr);

                Arr.push(obj);

                document.querySelector('#CloudDt').innerHTML = Cloud;
                document.querySelector('#Cloud_descDt').innerHTML = Cloud_desc;
                document.querySelector('#TempDt').innerHTML = Temp;
                document.querySelector('#Wind_degDt').innerHTML = Wind_deg;
                document.querySelector('#Wind_SpeedDt').innerHTML = Wind_Speed;

                markSelectedCity(selectCityName);
                mymap.flyTo([lat, lon], 4);

            })
    }

    const Minutes = new Date().getMinutes()
    Times.set(selectCityName, Minutes);
}
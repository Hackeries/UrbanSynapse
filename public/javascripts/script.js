const socket = io();
const map = L.map("map").setView([0,0], 16);
// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);
const markers = {};
document.getElementById("fetchLocation").addEventListener("click", () => {
    const address = document.getElementById("address").value;
    if (address) {
       
        socket.emit("fetch-address-location", { address });
    } else {
        alert("Please enter an address.");
    }
});
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    map.setView([latitude, longitude], 16);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
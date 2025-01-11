const socket = io();
console.log("hey");

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Sending location:", latitude, longitude); // Debugging log
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.log(error); // Log geolocation error
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.log("Geolocation is not available.");
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {}; // Object to keep track of user markers

socket.on("receive-location", (data) => {
    console.log("Received location data:", data); // Debugging log
    const { id, latitude, longitude } = data;

    // Check if the user already has a marker
    if (markers[id]) {
        // Update the existing marker's position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // If no marker exists, create a new one
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    // Adjust the map view to the latest position
    map.setView([latitude, longitude]);
});

socket.on("user-disconnected", (id) => {
    // Remove the marker for the disconnected user
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove the user's marker
        delete markers[id]; // Clean up the user's marker from the object
        console.log(`Removed marker for user: ${id}`); // Debugging log
    }
});

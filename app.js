const express = require('express');
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io"); 
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); 

const users = {};  // To store the locations of each user by their id

io.on("connection", function(socket) {
    console.log("User connected:", socket.id);  // Log user connection

    // Listen for location updates from the client
    socket.on("send-location", function(data) {
        // Store the user's location in the users object
        users[socket.id] = data;

        // Emit the location to all clients
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", function() {
        // Remove the user from the list of users
        delete users[socket.id];

        // Notify all clients that this user has disconnected
        io.emit("user-disconnected", socket.id);
        console.log("User disconnected:", socket.id);  // Log user disconnection
    });
});

app.get("/", function(req, res) {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});  

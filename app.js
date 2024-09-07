const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const app = express();
const config = require('./config');
const axios = require("axios");
// const dashboardRoutes = require('./routes/dashboard');
// MAP PART
const http = require("http");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

//io connection request
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle fetching of geolocation based on address
    socket.on("fetch-address-location", async ({ address }) => {
        try {
            // Fetch location using Nominatim API (or any other geocoding service)
            const response = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: address,
                    format: "json",
                    limit: 1,
                },
            });

            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                // Emit location data back to the client
                io.emit("receive-location", { id: socket.id, latitude: parseFloat(lat), longitude: parseFloat(lon) });
            } else {
                console.error("Location not found for the address:", address);
            }
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
        console.log("User disconnected:", socket.id);
    });
});


// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/auth')); // Login and authentication routes
app.use('/tasks', require('./routes/task')); // Other routes
app.use('/projects', require('./routes/project'));
app.use('/discussions', require('./routes/discussion'));
// app.use('/dashboard', dashboardRoutes);

// Landing Page Route
app.get('/', (req, res) => {
    res.render('landing');
});

// app.get('/dashboard', (req, res) => {
//     res.render('dasboard');
// });


app.get('/projectRegister', (req, res) => {
    res.render('projectRegister');
});

app.get('/helpdesk', (req, res) => {
    res.render('helpdesk');
});

// Start server
app.listen(3000, () => {
    console.log("Server Listening at port 3000");
});

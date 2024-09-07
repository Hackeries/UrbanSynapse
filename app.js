const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const axios = require('axios');
const http = require('http');
const socketio = require('socket.io');
const config = require('./config'); // Import the updated config

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies in production
}));

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process if database connection fails
    });

// Routes
app.use('/', require('./routes/auth')); // Login and authentication routes
app.use('/tasks', require('./routes/task')); // Task routes
app.use('/projects', require('./routes/project')); // Project routes
app.use('/discussions', require('./routes/discussion')); // Discussion routes
app.use('/dashboard', require('./routes/dashboard')); // Dashboard route

// Landing Page Route
app.get('/', (req, res) => {
    res.render('landing', { user: req.session.userId });
});

// Project Registration Route
app.get('/projectRegister', (req, res) => {
    res.render('projectRegister');
});

// Helpdesk Page Route
app.get('/helpdesk', (req, res) => {
    res.render('helpdesk');
});

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    try {
        // Fetch tasks from your database or source
        const tasks = await getTasks(); // Replace with actual function to get tasks

        // Render the EJS template and pass tasks as a variable
        res.render('landing', { tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle fetching of geolocation based on address
    socket.on('fetch-address-location', async ({ address }) => {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                },
            });

            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                io.emit('receive-location', { id: socket.id, latitude: parseFloat(lat), longitude: parseFloat(lon) });
            } else {
                console.error('Location not found for the address:', address);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        io.emit('user-disconnected', socket.id);
        console.log('User disconnected:', socket.id);
    });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

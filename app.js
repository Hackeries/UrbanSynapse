const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const axios = require('axios');
const http = require('http');
const socketio = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User'); // Import User model
const bcrypt = require('bcrypt');
const config = require('./config'); // Import the updated config

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: config.sessionSecret || 'your-secret-key', // Ensure you have a secret key in your config
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

passport.use(new LocalStrategy(
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user || !await bcrypt.compare(password, user.password)) {
                return done(null, false, { message: 'Incorrect credentials.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process if database connection fails
    });

// Middleware to set `user` in res.locals
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Ensure req.user is set by authentication middleware
    next();
});

// Routes
app.use('/', require('./routes/auth')); // Login and authentication routes
app.use('/tasks', require('./routes/task')); // Task routes
app.use('/projects', require('./routes/project')); // Project routes
app.use('/discussions', require('./routes/discussion')); // Discussion routes
app.use('/dashboard', require('./routes/dashboard')); // Dashboard route

// Landing Page Route
app.get('/', (req, res) => {
    res.render('landing', { user: res.locals.user });
});

// Project Registration Route
app.get('/projectRegister', (req, res) => {
    res.render('projectRegister', { user: res.locals.user });
});

// Helpdesk Route
app.get('/helpdesk', (req, res) => {
    res.render('helpdesk', { user: res.locals.user });
});

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    try {
        const tasks = await getTasks(); // Replace with actual function to get tasks
        res.render('dashboard', { tasks, user: res.locals.user });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

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
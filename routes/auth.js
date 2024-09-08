// const express = require('express');
// const bcrypt = require('bcrypt');
// const router = express.Router();
// const User = require('../models/User');
// const isAuthenticated = require('../middleware/auth'); // Import the middleware

// // Render login page
// router.get('/login', (req, res) => {
//     res.render('login', { error_msg: null, success_msg: null }); // Ensure error_msg is defined
// });


// // Example login route
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (user && await bcrypt.compare(password, user.password)) {
//             req.session.user = user; // Store user object in session
//             res.redirect('/landing');
//         } else {
//             res.render('login', { error_msg: 'Invalid credentials', success_msg: null });
//         }
//     } catch (err) {
//         console.error('Error during login:', err);
//         res.status(500).render('login', { error_msg: 'Server error', success_msg: null });
//     }
// });


// // Render registration page
// router.get('/register', (req, res) => {
//     res.render('register', { error_msg: null });
// });

// // Handle registration form submission
// router.post('/register', async (req, res) => {
//     const { firstName, lastName, email, password } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//         return res.render('register', { error_msg: 'All fields are required' });
//     }

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.render('register', { error_msg: 'User already exists' });
//         }

//         // Hash the password and create a new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({
//             firstName,
//             lastName,
//             email,
//             password: hashedPassword
//         });

//         await user.save();

//         // Redirect to login page after successful registration
//         res.render('login', { error_msg: null, success_msg: 'Registration successful. Please log in.' });
//     } catch (error) {
//         console.error('Error registering user:', error);
//         if (error.code === 11000) { // Duplicate key error
//             return res.render('register', { error_msg: 'Email already exists' });
//         }
//         res.status(500).render('register', { error_msg: 'Error registering user' });
//     }
// });


// router.get('/landing', isAuthenticated, (req, res) => {
//     console.log('User:', req.session.user);
//     res.render('landing', { user: req.session.user }); // Pass user object to the view
// });


// // handle logout
// router.post('/logout', isAuthenticated, (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('Error logging out:', err);
//             return res.redirect('/landing'); // Redirect back to landing on error
//         }
//         res.redirect('/login'); // Redirect to login page after successful logout
//     });
// });


// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

// Render login page
router.get('/login', (req, res) => {
    res.render('login', { error_msg: null });
const User = require('../models/User');
const flash = require('connect-flash');
const isAuthenticated = require('../middleware/auth'); // Import the middleware

// Render login page
router.get('/login', (req, res) => {
    res.render('login', { error_msg: req.flash('error'), success_msg: req.flash('success') });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); } // Handle error
        if (!user) { 
            req.flash('error', info.message || 'Login failed'); 
            return res.redirect('/login'); 
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash('success', 'You are now logged in!');
            res.redirect('/'); // Redirect to home or another page
        });
    })(req, res, next);
});

// Render registration page
router.get('/register', (req, res) => {
    res.render('register', { error_msg: req.flash('error'), success_msg: req.flash('success') });
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const user = await User.findOne({ email }); // Ensure field name matches your schema
        if (user && await bcrypt.compare(password, user.password)) { // Use bcrypt to compare passwords
            // Redirect to landing page after successful login
            res.render('landing');
        } else {
            res.render('login', { error_msg: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
    if (!firstName || !lastName || !email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'User already exists');
            return res.redirect('/register');
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();

        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'Error registering user');
        res.redirect('/register');
    }
});

router.get('/landing', (req, res) => {
    console.log('Session User:', req.session.user); // Debugging log
    res.render('landing', { user: req.session.user });
});


// Handle logout
// router.post('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('Error logging out:', err);
//             return res.redirect('/landing'); // Redirect back to landing on error
//         }
//         res.redirect('/login'); // Redirect to login page after successful logout
//     });
// });

router.post('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out');
    res.redirect('/');
});

// Render registration page
router.get('/register', (req, res) => {
    res.render('register', { error_msg: null });
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error_msg: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error_msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ error_msg: 'Email already exists' });
        }
        res.status(500).json({ error_msg: 'Error registering user' });
    }
});

module.exports = router;
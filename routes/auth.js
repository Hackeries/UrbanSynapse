const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

// Render login page
router.get('/login', (req, res) => {
    res.render('login', { error_msg: null });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

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

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path to your User model
const Project = require('../models/Project'); // Adjust the path to your Project model

// Handle login page rendering
router.get('/login', function(req, res) {
    res.render('login');
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user in the database
        const user = await User.findOne({ EmailId: email });

        if (user && user.Password === password) {
            // Find projects where city matches user's city
            const projects = await Project.find({ city: user.City });

            // Credentials are valid, redirect to user.ejs and pass user object and projects
            res.render('user', {
                FirstName: user.FirstName,
                LastName: user.LastName,
                EmailId: user.EmailId,
                ContactNumber: user.ContactNumber,
                Department: user.Department,
                City: user.City,
                projects: projects // Pass the array of projects
            });
        } else {
            // Invalid credentials, render login page with error message
            res.render('login', { error_msg: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

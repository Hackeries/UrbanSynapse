const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');

// Dashboard Route
router.get('/', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        // Find user in the database
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        // Find projects where city matches user's city
        const projects = await Project.find({ city: user.city }); // Use lowercase if 'city' is the correct field name

        // Render the dashboard view with user and project data
        res.render('dashboard', {
            firstName: user.firstName, // Use consistent casing
            lastName: user.lastName,
            emailId: user.emailId,
            contactNumber: user.contactNumber,
            department: user.department,
            city: user.city,
            projects: projects // Pass the array of projects
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

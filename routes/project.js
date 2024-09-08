const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// List all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.render('projects', { projects });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.redirect('/');
    }
});

// Render form to add a new project
router.get('/add', (req, res) => {
    res.render('add-project');
});

// Handle adding a new project
router.post('/add', async (req, res) => {
    const { name, description, startDate, city, departments } = req.body;

    // Input validation
    if (!name || !city) {
        return res.redirect('/projects/add'); // Redirect back to form with error message if needed
    }

    try {
        const project = new Project({ name, description, startDate, city, departments });
        await project.save();
        res.redirect('/projects');
    } catch (err) {
        console.error('Error saving project:', err);
        res.redirect('/projects/add'); // Redirect back to form with error message if needed
    }
});

module.exports = router;

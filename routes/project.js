const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Project Routes
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.render('projects', { projects });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/add', (req, res) => res.render('add-project'));
router.post('/add', async (req, res) => {
    const { name, description, startDate, endDate } = req.body;
    try {
        const project = new Project({ name, description, startDate, endDate });
        await project.save();
        res.redirect('/projects');
    } catch (err) {
        console.error(err);
        res.redirect('/projects/add');
    }
});

module.exports = router;

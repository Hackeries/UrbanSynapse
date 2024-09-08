const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// Dashboard Route
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const tasks = await Task.find().populate('assignedTo');
        res.render('dashboard', { tasks });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Add Task Route
router.get('/add', (req, res) => res.render('add-task'));

router.post('/add', async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;
    try {
        const task = new Task({ title, description, assignedTo, dueDate });
        await task.save();
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.redirect('/tasks/add');
    }
});

module.exports = router;

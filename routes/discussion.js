const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const User = require('../models/User');

// Discussion Routes
router.get('/', async (req, res) => {
    try {
        const discussions = await Discussion.find().populate('participants');
        res.render('discussion', { discussions });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/add', async (req, res) => {
    const { topic, participants } = req.body;
    try {
        const discussion = new Discussion({ topic, participants });
        await discussion.save();
        res.redirect('/discussions');
    } catch (err) {
        console.error(err);
        res.redirect('/discussions');
    }
});

module.exports = router;

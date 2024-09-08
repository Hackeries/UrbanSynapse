const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');

// Apply the middleware to all routes in this router
router.use(isAuthenticated);

router.get('/someFeature', (req, res) => {
    res.render('someFeature'); // Render feature page
});

module.exports = router;
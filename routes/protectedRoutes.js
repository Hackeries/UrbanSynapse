const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');

// Apply the middleware to all routes in this router
router.use(isAuthenticated);

router.get('/someFeature', (req, res) => {
    res.render('someFeature'); // Render feature page
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> d700c7838707771037971175418573abc36cfab0

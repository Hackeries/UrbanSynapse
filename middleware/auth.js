const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next(); // User is authenticated, proceed to the requested route
    } else {
        res.redirect('/'); // Redirect to login page if not authenticated
    }
};

module.exports = isAuthenticated;

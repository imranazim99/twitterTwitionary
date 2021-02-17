var express = require('express');
const { ensureAuth } = require('../../middleware/ap/auth');
var router = express.Router();

// admin panel routes
// #import
var dashboard       = require('./dashboard'),
    login       = require('./login');
// #use
router.use('/ap', dashboard);
router.use('/ap/auth', login);

router.get('/ap/*', ensureAuth, (req, res) => {
    res.redirect('/ap/dashboard');
})

module.exports = router;
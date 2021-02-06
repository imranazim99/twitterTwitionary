var express = require('express');
var router = express.Router();

// site routes
// #import
var index       = require('../site/index');

// Blog
var blog        = require('../site/blog/index');

// #use
router.use('/', index);

// Blog
router.use('/blog', blog);
router.get('/blog', (req, res) => {
    res.redirect('/blog/search');
})

module.exports = router;
var express = require('express');
const { ensureAuth, forwardAuth } = require('../../middleware/ap/auth');
var router = express.Router();

const baseUrl = '/ap';

// This will show admin home page
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('ap/dashboard',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Dashboard"
    });
})

module.exports = router;
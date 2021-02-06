var express = require('express');
var router = express.Router();

// This will show index page
router.get('/', (req, res) => {
    res.render('site/index',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Home"
    });
})

module.exports = router;
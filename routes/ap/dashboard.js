var express = require('express');
const { ensureAuth, forwardAuth } = require('../../middleware/ap/auth');
var router = express.Router();
const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const   Tweet = require('../../models/tweet'),
        Hashtag = require('../../models/hashtag'),
        Keyword = require('../../models/keyword');

const baseUrl = '/ap';

// This will show admin home page
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('ap/dashboard',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Dashboard"
    });
})

// count total keywords
router.get('/total-keywords/count', ensureAuth, async (req, res) => {
    const totalKeywords = await Keyword.count();
    res.send({
        "success": true,
        "totalKeywords": totalKeywords
    });
})
// count total tweets scrapped
router.get('/total-tweets-scrapped/count', ensureAuth, async (req, res) => {
    const totalTweetsScrapped = await Tweet.count();
    res.send({
        "success": true,
        "totalTweetsScrapped": totalTweetsScrapped
    });
})
// show all tweets by keywords
router.get('/keywords-tweets/graph', ensureAuth, async (req, res) => {
    let sql = 'SELECT COUNT(h.ID) as totalKeywords, h.title as title FROM hashtags h JOIN keywords k on h.title = k.keyword GROUP BY h.title';
    var result = await Hashtag.sequelize.query(sql, { type: QueryTypes.SELECT });
    res.send({
        "success": true,
        "tweetsByKeywords": result
    });
})

module.exports = router;
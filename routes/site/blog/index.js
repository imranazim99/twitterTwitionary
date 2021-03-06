var express     = require('express'),
    Sentiment   = require('sentiment'),
    dateFormat   = require('dateformat'),
    Twit = require('twit');
var router = express.Router();

const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});
const   Tweet = require('../../../models/tweet'),
        Hashtag = require('../../../models/hashtag'),
        Keyword = require('../../../models/keyword');

// twitter keys
var T = new Twit({
    consumer_key:         'iJFZnuM0YHqwvFilNUBSVkzJU',
    consumer_secret:      '412n9RVFyUc4lRH3RWBU4kRT1lz5NHWg81d6FEoMPQEvYJPRio',
    access_token:         '813456180-jXG4M0Kpc80UjJF4bhwA0z9Bx8aZfAht4veyxSgc',
    access_token_secret:  'Cvh3gsUS5Y4HpyfD1UdlMLfpxlqa47iYFo3vxogpP6blR',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
  });
// ./twitter keys

// This will show index page
router.get('/search', (req, res) => {
    res.render('site/blog/index',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Home"
    });
})


// get counts data load
router.post('/tweets/count-data', async (req, res) => {
    let checkBox = req.body.checkbox;
    let searchKey = req.body.search;
    var count_username = 0; var tweets_count = 0; var tweets_location = 0; var retweets_count = 0; var total_tweets = 0; var total_followers = 0;

    if(checkBox == 'database') {
        // count all tweets
        var sql = 'select COUNT(distinct username) as totalUsername,COUNT(a.ID) as totalId,COUNT(distinct location) as totalLocation,SUM(retweetCount) as totalRetweet,COUNT(totalTweets) as totalTweets,sum(followers) as totalFollowers from tweets a JOIN hashtags b ON a.ID = b.tweet_ID WHERE b.title LIKE "%'+searchKey+'" ORDER BY a.ID';
        var totalCounts = await Tweet.sequelize.query(sql, { type: QueryTypes.SELECT });

        totalCounts.forEach(tweet => {
            count_username  = tweet.totalUsername;
            tweets_count    = tweet.totalId;
            tweets_location = tweet.totalLocation;
            retweets_count  = tweet.totalRetweet;
            total_tweets    = tweet.totalTweets;
            total_followers = tweet.totalFollowers;
        });
        res.send({
            'success':          true,
            'count_username':   count_username, 
            'tweets_count':     tweets_count,
            'tweets_location':  tweets_location,
            'retweets':         retweets_count,
            'totalTweets':      total_tweets,
            'total_followers':  total_followers
        });
    } else {
        T.get('search/tweets', { q: searchKey, count: 100 }, async function(err, data, response) {
            // console.log('count data: ', data)
            var result = data.statuses;
            result.forEach(item => {
                tweets_count += item.user.statuses_count;

                if(item.user.location) {
                    tweets_location += 1;
                }
                
                retweets_count  += item.retweet_count;
                total_tweets    += item.user.statuses_count;
                total_followers += item.user.followers_count;
            })

            res.send({ 
                'success':          true,
                'tweets_count':     tweets_count,
                'tweets_location':  tweets_location,
                'retweets':         retweets_count,
                'totalTweets':      total_tweets,
                'total_followers':  total_followers
            });
        })
    }

})

// get chart data
router.post('/tweets/chart-data', async (req, res) => {
    let checkBox = req.body.checkbox;
    let searchKey = req.body.search;
    var greatCounter = 0; var goodCounter = 0; var neutralCounter = 0; var badCounter = 0; var terribleCounter = 0;
    let countDateArr = [];
    if(checkBox == 'database') {
        var sql = 'SELECT tt.*, th.* FROM tweets as tt LEFT JOIN hashtags as th on tt.ID = th.tweet_ID WHERE th.title LIKE "%'+searchKey+'" ORDER BY tt.ID';

        var result = await Tweet.sequelize.query(sql, { type: QueryTypes.SELECT });
            // console.log('dataa: ', result);
            result.forEach(item => {
                var checkText = sentimentAnalysis(item.text);
                switch(checkText) {
                    case 'Great':
                        greatCounter += 1;
                        break;
                    case 'Good':
                        goodCounter += 1;
                        break;
                    case 'Neutral':
                        neutralCounter += 1;
                        break;
                    case 'Bad':
                        badCounter += 1;
                        break;
                    case 'Terrible':
                        terribleCounter += 1;
                        break;
                }
            });

            // count tweets by date for linear chart
            var sql2 = 'select count(a.ID) as totalId, DATE(tweetCreatedAt) as date FROM tweets a JOIN hashtags b on a.ID = b.tweet_ID WHERE b.title LIKE "%'+searchKey+'" group by DATE(tweetCreatedAt)';
            var tweetsByDate = await Tweet.sequelize.query(sql2, { type: QueryTypes.SELECT });

            tweetsByDate.forEach(tweetByDt => {
                var dt = tweetByDt.date;
                const formatedDate = dateFormat(dt, "mm/dd/yyyy");
                countDateArr.push({
                    'countTweets'    : tweetByDt.totalId,
                    'bydate'        : formatedDate
                });
            })

            res.send({
                'success':          true,
                'great':            greatCounter,
                'good':             goodCounter,
                'nutral':           neutralCounter,
                'bad':              badCounter,
                'terr':             terribleCounter,
                'countDates':       countDateArr
            });
    } else {
        T.get('search/tweets', { q: searchKey, count: 100 }, async function(err, data, response) {
            var result = data.statuses;
            let total_tweets = 0;
            result.forEach(item => {
                // console.log('dataa: ', item);
                var checkText = sentimentAnalysis(item.text);
                switch(checkText) {
                    case 'Great':
                        greatCounter += 1;
                        break;
                    case 'Good':
                        goodCounter += 1;
                        break;
                    case 'Neutral':
                        neutralCounter += 1;
                        break;
                    case 'Bad':
                        badCounter += 1;
                        break;
                    case 'Terrible':
                        terribleCounter += 1;
                        break;
                    default: 
                    console.log('Unknown value.');
                }
                total_tweets += item.user.statuses_count;
            })
            // for tweets linear chart
            var dt = new Date();
            const formatedDate = dateFormat(dt, "mm/dd/yyyy");
                countDateArr.push({
                    'countTweets'    : total_tweets,
                    'bydate'        : formatedDate
                });
            res.send({
                'success':          true, 
                'great':            greatCounter,
                'good':             goodCounter,
                'nutral':           neutralCounter,
                'bad':              badCounter,
                'terr':             terribleCounter,
                'countDates':       countDateArr,
            });
        })
    }
})

// 



// #get values from db and twitter
router.post('/tweets/search', async (req, res) => {
    let checkBox = req.body.checkbox;
    let searchKey = req.body.search;
    let postArr = [];

    if(checkBox == 'database') {
        let startdb = 0;
        if(req.body.startdb) {
            startdb = req.body.startdb;
        }
        // console.log('dtstart: ', startdb)
        var sql = 'SELECT tt.*, th.* FROM tweets as tt LEFT JOIN hashtags as th on tt.ID = th.tweet_ID WHERE th.title LIKE "%'+searchKey+'" ORDER BY tt.ID LIMIT '+startdb+', 6';

        var result = await Tweet.sequelize.query(sql, { type: QueryTypes.SELECT });
            // console.log('dataa: ', result);
            result.forEach(item => {
                
                postArr.push({
                    'Id'            : item.ID,
                    'tweetId'       : item.ID,
                    'username'      : item.username,
                    'userUrl'       : item.userUrl,
                    'blogUrl'       : "/blog/mapper?search="+item.username,
                    'description'   : item.description
                });
            })
            // #end foreach
            // console.log('posts: ', postArr)
        res.send({
            'success':          true,
            'posts':            postArr,
            'startdb':          Number(startdb)+6
        });

    } else {
        // realtime data from twitter api
        let maxId = '';
        if(req.body.next_result) {
            maxId = req.body.next_result;
        }
        T.get('search/tweets', { q: searchKey, count: 6, max_id: maxId }, async function(err, data, response) {
            // console.log('twit data: ', data.search_metadata)
            if(data.search_metadata.next_results != null) {
                resultsExist = data.search_metadata.next_results;
                isEqualsToLocation = resultsExist.indexOf('=');
                andLocation = resultsExist.indexOf('&');
                maxId = resultsExist.substring(isEqualsToLocation+1,andLocation);
                // console.log('maxId', maxId)
            }

            var result = data.statuses;
            result.forEach(item => {
                postArr.push({
                    'Id'            : item.user.id,
                    'tweetId'       : item.id,
                    'username'      : item.user.screen_name,
                    'userUrl'       : "https://twitter.com/user/status/"+item.id_str,
                    'blogUrl'       : "/blog/mapper?search="+item.user.screen_name,
                    'description'   : item.user.description
                });
            })

            res.send({
                'success':          true,
                'posts':            postArr,
                'next_result':      maxId
            });
        })
    }
})


// this is used for sentence analysis
function sentimentAnalysis(text) {
    var sentiment = new Sentiment();
    var result = sentiment.analyze(text);
    var roundTwo = result.comparative.toFixed(1);
    // console.log('resutl: ', roundTwo);
    if (roundTwo >= 1.0) {
        return 'Great';
    } else if(roundTwo >= 0.7) {
        return 'Good';
    } else if(roundTwo >= 0.0) {
        return 'Neutral';
    } else if(roundTwo >= -0.7) {
        return 'Bad';
    } else if(roundTwo >= -1.0) {
        return 'Terrible';
    }  
}


// ===================================
//          Mapper
// ===================================
// mapper
router.get('/mapper', (req, res) => {
    let searchKey = req.query.search;
    res.render('site/blog/mapper',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Mapper",
        search: searchKey
    });
})
// AJAX call load user details
router.post('/mapper/load-user-detail', (req, res) => {
    const searchKey = req.body.search;
    const qSearch = req.body.q_search;
    if(searchKey && qSearch == "user") {
        T.get('statuses/user_timeline', { screen_name: searchKey, count: 1 }, async function(err, data, response) {
            // console.log('User: ', data[0])
            if(data && data.length > 0) {
                const createAt = dateFormat(data[0].user.created_at, "ddd, mmm dS, yyyy, h:MM TT");
                return res.status(200).send({
                    "success": true,
                    "screenName": data[0].user.screen_name,
                    "createdAt": createAt,
                    "totalTweets": data[0].user.statuses_count,
                    "name": data[0].user.name,
                    "followerCount": data[0].user.followers_count,
                    "followingCount": data[0].user.friends_count,
                    "location": data[0].user.location ? data[0].user.location:'not found',
                    "profileImage": data[0].user.profile_image_url,
                });
            } else if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, that page does not exist. Try again please!"
                });
            }
        })
    } else if(searchKey && qSearch == "tweets") {
        T.get('statuses/user_timeline', { screen_name: searchKey, count: 20 }, async function(err, data, response) {
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no tweets found for the user "+searchKey
                });
            } else {
                // console.log(data)
                res.send({
                    "success": true,
                    "dataArr": data
                });
            }
        })
    } else if(searchKey && qSearch == "followers") {
        T.get('followers/list', { screen_name: searchKey, count: 20 }, async function(err, data, response) {
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no followers found for the user @"+searchKey
                });
            } else {
                res.send({
                    "success": true,
                    "dataArr": data.users,
                    'nextCursor': data.next_cursor
                });
            }
        })
    } else if(searchKey && qSearch == "followings") {
        T.get('friends/list', { screen_name: searchKey, count: 20 }, async function(err, data, response) {
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no followings found for the user @"+searchKey
                });
            } else {
                res.send({
                    "success": true,
                    "dataArr": data.users,
                    "nextCursor": data.next_cursor
                });
            }
        })
    } else {
        return res.send({
            "success": false,
            "msg": "Please enter correct username and try again, please!"
        });
    }
})

// load more data for a user
router.post('/mapper/user/load-more', (req, res) => {
    const searchKey = req.body.search;
    const qSearch = req.body.q_search;
    const maxId = req.body.lastId;
    if(qSearch == 'tweets') {
        T.get('statuses/user_timeline', { screen_name: searchKey, count: 20, max_id: maxId }, async function(err, data, response) {
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no more data found for the user @"+searchKey
                });
            } else {
                // console.log('Id: '+maxId+' == '+data)
                res.send({
                    "success": true,
                    "dataArr": data
                });
            }
        })
    } else if(qSearch == 'followers') {
        let nextCursor = req.body.nextCursor;
        T.get('followers/list', { screen_name: searchKey, count: 20, cursor: nextCursor }, async function(err, data, response) {
            // console.log('next cursor: ', data)
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no more data found for the user @"+searchKey
                });
            } else {
                res.send({
                    "success": true,
                    "dataArr": data.users,
                    'nextCursor': data.next_cursor
                });
            }
        })

    } else if(qSearch == 'followings') {
        let nextCursor = req.body.nextCursor;
        T.get('friends/list', { screen_name: searchKey, count: 20, cursor: nextCursor }, async function(err, data, response) {
            if(err) {
                return res.send({
                    "success": false,
                    "msg": "Sorry, There were no more data found for the user @"+searchKey
                });
            } else {
                res.send({
                    "success": true,
                    "dataArr": data.users,
                    "nextCursor": data.next_cursor
                });
            }
        })

    } else {
        res.send({
            "success": false,
            "dataArr": '',
            "msg": 'Something went wrong!'
        });
    }
})


// ===================================
//          Keywords
// ===================================
// keywords page render
router.get('/keywords', (req, res) => {
    res.render('site/blog/keywords',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Keywords"
    });
})
// #get list of keywords
router.get('/keywords/get', (req, res) => {
    Keyword.findAll({}).then(result => {
        res.send({
            "success": true,
            "dataArr": result
        });
    }).catch(err => {
        res.send({
            "success": false,
            "msg": 'Error! Something went wrong. '+err
        });
    })
})
// #add keywords
router.post('/keyword/add', (req, res) => {
    if(req.body.keyword) {
        Keyword.create({
            keyword: req.body.keyword
        }).then(record => {
            console.log(record);
            res.send({
                "success": true,
                "msg": "Record has been added successfully."
            });
        }).catch(err => {
            let msg = 'Error! Something went wrong. '+err;
            if(err.original.sqlMessage) {
                msg = err.original.sqlMessage;
            }
            res.send({
                "success": false,
                "msg": msg
            });
        })
    }
})
// #update keyword
router.post('/keyword/update', (req, res) => {
    if(req.body.keyword != '') {
        Keyword.update(
            { keyword: req.body.keyword },
            { where: { ID: req.body.Id } }
        ).then(result => {
            console.log('updated ',result);
            res.send({
                "success": true,
                "msg": "Record has been udpated successfully."
            });
        }).catch(err => {
            let msg = 'Error! Something went wrong. '+err;
            if(err.original.sqlMessage) {
                msg = err.original.sqlMessage;
            }
            res.send({
                "success": false,
                "msg": msg
            });
        })
    }
})
// #delete keyword
router.get('/keyword/delete/:id', (req, res) => {
    if(req.params.id) {
        Keyword.destroy({
                where: {
                    ID: req.params.id
                }   
            }).then(record => {
            console.log('deleted ',record);
            res.send({
                "success": true,
                "msg": "Record has been deleted successfully."
            });
        }).catch(err => {
            res.send({
                "success": false,
                "msg": 'Error! Something went wrong. '+err
            });
        })
    }
})

/*=============================================
                Reports
===============================================*/
// reports
router.get('/reports', (req, res) => {
    res.render('site/blog/reports',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Reports"
    });
})

router.post('/tweets/report', async (req, res) => {
    const fromDate = req.body.fromdate;
    const toDate = req.body.todate;
    if(fromDate != '' && toDate != '') {
        let tweetsArr = [], keywordsArr = [];
        let sql = 'SELECT COUNT(ID) as totalTweets, DATE(tweetCreatedAt) as onDate FROM tweets WHERE DATE(tweetCreatedAt) BETWEEN "'+fromDate+'" AND "'+toDate+'" GROUP BY DATE(tweetCreatedAt)';
        var result = await Tweet.sequelize.query(sql, { type: QueryTypes.SELECT });
        // console.log(result)
        let allTweets = 0;
        result.forEach(item => {
            tweetsArr.push({
                'totalTweets': item.totalTweets,
                'onDate': item.onDate
            });
            allTweets += item.totalTweets;
        });

        let sql2 = 'SELECT COUNT(h.ID) as totalKeywords, h.title as title FROM hashtags h JOIN keywords k on h.title = k.keyword GROUP BY h.title';
        var result2 = await Hashtag.sequelize.query(sql2, { type: QueryTypes.SELECT });
        let allKeywords = 0;
        result2.forEach(item => {
            keywordsArr.push({
                'totalKeywords': item.totalKeywords,
                'title': item.title
            });
            allKeywords += item.totalKeywords;
        });

        res.send({
            'success': true,
            'tweetsArr': tweetsArr,
            'allTweets': allTweets,
            'keywordsArr': keywordsArr,
            'allKeywords': allKeywords,
            'fromDate': fromDate,
            'toDate': toDate
        })
    } else {
        res.send({
            'success': false,
            'msg': 'Select to and from date and try again please.',
            'fromDate': fromDate,
            'toDate': toDate
        })
    }
})

module.exports = router;
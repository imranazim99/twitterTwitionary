var express = require('express'),
    passport = require('passport'),
    User = require('../../models/user'),
    // Image = require('../models/image'),
    fs = require('fs'),
    router = express.Router();
var async = require("async");
const { forwardAuth } = require('../../middleware/ap/auth');
const baseUrl = '/ap/auth';

// This will register
// router.post('/register', (req, res) => {
//     User.create({
//         username: req.body.username,
//         password: req.body.code,
//         name: req.body.name,
//         code: req.body.code,
//         gender: req.body.gender,
//         contactNo: req.body.contactNo,
//         role_id: req.body.role
//     }).then(function (user) {
//         res.send({ success: user });
//     }).catch(function (err) {
//         res.send({ error: err.original.sqlMessage });
//     });
// })

// this will render login page
router.get('/login', forwardAuth, (req, res) => {
    res.render('ap/login', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error')
    });
});

// This method is used to register new user and admin as well
// router.post("/register", function (req, res) {

//     var dir = "./public/uploads/user/";
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//       }
//     let sampleFile = req.files.image;
//     if (sampleFile != undefined && sampleFile.name != undefined) {
//         var imagename = dir + Date.now()/1000 + "-" + sampleFile.name;
//     }
//     else {
//         req.flash('error', "Please Upload Profile Picture");
//         res.redirect(baseUrl+'/login');
//     }

//     //Use the mv() method to place the file somewhere on your server
//     sampleFile.mv(imagename, function (err) {
//         if (err) {
//             req.flash('error', "Directory Doesn't Exist");
//             res.redirect(baseUrl+'/login');
//         }
//     });
//     imagename = imagename.substring(9);
//     Image.create({
//         title: "profile Image",
//         date: new Date,
//         url: imagename,
//     }, (err, newImage) => {
//         var newUser = new User({
//             username: req.body.email.toLowerCase(),
//             name: req.body.name,
//             gender: req.body.gender,
//             createdAt: new Date,
//             image: newImage.id
//         });
//         User.register(newUser, req.body.password, function (err, user) {
//             if (err) {
//                 req.flash('error', err.message);
//                 res.redirect(baseUrl+'/login');
//             } else {
//                 req.flash('success', 'Congratulations! '+user.name+' your account has been created successfully. Now you can Sign in.');
//                 res.redirect(baseUrl+'/login');
//             }
//         });
//     })
// });


// This will login a user
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            req.flash('error', "" + err); // will generate a 500 error
            return res.redirect(baseUrl+'/login');
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {
            // return res.status(400).send(info.message);
            req.flash('error', "" + info.message);
            return res.redirect(baseUrl+'/login');
        }
        req.login(user, loginErr => {
            if (loginErr) {
                req.flash('error', "" + loginErr);
                return res.redirect(baseUrl+'/login');
            }
            user.isActive = true;
            user.save();
            req.flash('success', 'Welcome ' + user.name);
            res.redirect("/ap/dashboard");
        });
    })(req, res, next);

});

// =================== quick start to create admin panel user ========================
/* var Role = require("../../models/role");
    router.get('/create-admin/user', (req, res) => {
        Role.create({
            title: "Admin",
            permission: "admin"
        }).then(function(role) {
            console.log('Role created: ', role);
            User.create({
                username: "imranazim99@gmail.com",
                password: "123",
                name: "Imran Azim",
                gender: "male",
                contactNo: "03005858958",
                image: "/ap/images/admin-avatar.png",
                role_id: role.id
            }).then(function (user) {
                res.status(err.status || 200).send('Admin panel user created: '+ user);
            }).catch(function (err) {
                res.status(err.status || 500).send('Error! '+ err);
            });
        }).then(function(err) {
            res.status(err.status || 500).send('Role Error! '+ err);
        })
    })
*/
// ================================== ./admin user ====================================

router.get('/logout', (req, res) => {
    // console.log(req.session);
    req.session.destroy();
    res.redirect(baseUrl+'/login');
})

module.exports = router;

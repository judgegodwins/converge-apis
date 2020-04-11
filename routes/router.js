const passport = require('passport');
const bcrypt = require('bcryptjs');
const areFriends = require('../socket').areFriends;
const multer = require('multer');
var upload = multer({dest: 'uploads'});
var cloudinary = require('cloudinary').v2;
const fs = require('fs');


module.exports = function(app, Model) {
    app.route('/login')
    .get((req, res) => {
        res.render('login')
    }).post(passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
        res.redirect('/');
    });

    app.get('/tests', (req, res) => {
        res.send('yay')
    })

    .route('/create_account')
    .get((req, res) => {
        res.render('createaccount');
    })
    .post((req, res, next) => {
        Model.findOne({username: req.body.username}, (err, user) => {
            if(err) return next(err);
            if(user) {
                return next(null, false);
            } else {
                let user = new Model({
                    username: req.body.username.toLowerCase(),
                    email: req.body.email,
                    first_name: req.body.firstname,
                    last_name: req.body.lastname,
                    gender: req.body.gender,
                    password: bcrypt.hashSync(req.body.password, 12),
                    lastSeen: new Date()
                })
                user.save((err, user) => {
                    if(err) return next(err);
                    next(null, user);
                })
            }
        })
    }, passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
        res.redirect('/');
    })

    app.get('/rd/:any/:any', (req, res) => {
        console.log('rd')
        res.redirect('/');
    })

    app.post('/updateprofile', upload.single('avatar'), (req, res) => {
        console.log('updating profile')
        Model.findById(req.user._id, (err, user) => {
            
            var oldpublic_id;

            if(user.profile_photo_url) {
                oldpublic_id = user.profile_photo_url.substring(user.profile_photo_url.lastIndexOf('/')+1, user.profile_photo_url.lastIndexOf('.'));
            }
            try {
                var upload_stream = cloudinary.uploader.upload_stream({tags: 'basic_sample'}, function(err, image) {
                    if(err) console.warn(err);
        
                    console.log('**', image.public_id);
                    user.old_photo_url = user.profile_photo_url;
                    user.profile_photo_url = image.secure_url;
                    console.log('uploading stream')
                    user.save((err, data) => {
                        if(err) return console.warn(err);
    
                        data.friends.forEach((friend) => {
                            Model.findOne({username: friend.username}, (err, person) => {
                                person.friends.find(x => {
                                    return x.username === req.user.username;
                                }).profile_photo = image.secure_url;
    
                                person.save((err) => {
                                    if(err) console.warn(err);
                                    
                                })
                            })
                        })
                        
                    })
    
                    res.json({url: image.secure_url});
    
                    console.log('*', image);
                });
    
                console.log('before uploading stream')
    
                fs.createReadStream('./uploads/' + req.file.filename).pipe(upload_stream);
    
                fs.unlink('./uploads/' + req.file.filename, (err) => {
                    if(err) throw err;
                    console.log('complete');
                })
                cloudinary.uploader.destroy(oldpublic_id, function(err, result) {
                    if(err) console.warn(err);
                    console.log('destroyed')
                    console.log(result);
                })
            } catch(err) {
                console.log(err);
            }
        })

        console.log('* > ', req.file.filename);

    })

    app.get('/geturl', (req, res) => {
        Model.findOne({username: req.query.username}, (err, user) => {
            res.send(user.profile_photo_url + ' ' + user.old_photo_url);
        })
    })

    function ensureAuthenticated(req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        res.redirect('/login');
    }

    app.get('/', ensureAuthenticated, (req, res) => {

        res.render('index', {
            friends: req.user.friends.filter((friend) => {

                return friend.friends_status === true;

            }), 
            user: req.user.username, 
            fullname: req.user.first_name + ' ' + req.user.last_name,
            photo_url: req.user.profile_photo_url
        });

        console.log(req.user.friends)
        // var io = require('../socket')();
    })

    app.get('/profile', (req, res) => {
        res.redirect('/');
    });

    app.get('/search', (req, res) => {
        var username = req.query.username;

        console.log(username);

        let results = [] 


        Model.find({}).select({password: 0, _id: 0, __v: 0, friends: 0}).exec((err, data) => {
            if(err) console.log(err);
            data.forEach((person) => {
                if(person.username.includes(username)) {

                    if(results.indexOf(person) < 0) {
                        results.push(person);

                        results.forEach((x) => {
                            x['arefriends'] = areFriends(x.username, req.user.username, Model);
                        })
                    }
                }
            })
  
            res.send(results);
        })
    });


    app.get('/test', (req, res) => {
        res.render('test');
    })

    app.get('/friend_request/:ind', async (req, res) => {
        const username = req.params.ind;
        console.log('add: ', username);
        function fixRequest(err, user) {
            if(!user) console.log('no user');
            user.friends.push({
                username: req.user.username,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                friends_status: false,
                messages: []
            })
            user.save((err, data) => {
                if(err) console.log(err);
                return data;                                                                                                                                                                                                                                                                    
            })
        }                                                                                   
        const sentTo = await Model.findOne({username: username}, fixRequest);

        await Model.findById(req.user._id, (err, user) => {
            user.friends.push({
                username: sentTo.username,
                first_name: sentTo.first_name,
                last_name: sentTo.last_name,
                friends_status: false,
                messages: []
            })
            user.save((err, data) => {
                if(err) console.log(err);

            })
        })

        res.send('success')
    });

    app.get('/logout', async (req, res) => {
        await Model.findById(req.user._id, (err, user) => {
            user.pushSubscription = '';
            user.save((err, data) => {
                if(err) console.log(err);
            })
        });
        req.logout();
        res.redirect('/login')
    });

    app.get('/requests', (req, res) => {
        res.render('requests', {requests: req.user.friends.filter((friend) => {
            return friend.friends_status === false;
        })})
    })

    app.get('/friends', (req, res) => {
        res.render('friends_list', {friends: req.user.friends.filter((friend) => {
            return friend.friends_status === true;
        })});
    })

    app.get('/all', (req, res) => {
        Model.find({}, (err, data) => {
            res.send(data);
        })
    })

    app
    .route('/messages')
    .get(ensureAuthenticated, (req, res) => {
        let username = req.query.username;

        Model.findById(req.user._id, (err, user) => {
            if(username = '*') {
                let allMessages = {

                };

                user.friends.forEach((friend) => {
                    allMessages[friend.username] = {
                        fullname: friend.first_name + ' ' + friend.last_name,
                        username: friend.username,
                        messages: friend.messages,
                        profile_img: friend.profile_photo || null
                    }
                })

                res.send(allMessages)

            } else {
                user.friends.forEach((friend) => {
                    if(username === friend.username) {
                        const messages = friend.messages;
                        res.send(messages);
                    }
                });
            }

        })
    })

    // app.get('/rem', (req, res) => {
    //     Model.remove({}, (err, data) => {
    //         if(!err) res.send('success')
    //     })
    // })

}
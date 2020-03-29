const passport = require('passport');
const bcrypt = require('bcryptjs');
const areFriends = require('../socket').areFriends;

module.exports = function(app, Model) {
    app.route('/login')
    .get((req, res) => {
        res.render('login')
    }).post(passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
        res.redirect('/');
    });

    app
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


    function ensureAuthenticated(req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        res.redirect('/login');
    }

    app.get('/', ensureAuthenticated, (req, res) => {

        res.render('index', {friends: req.user.friends.filter((friend) => {
            return friend.friends_status === true;

        }), user: req.user.username});

        console.log(req.user.friends)
        // var io = require('../socket')();
    })

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
                        messages: friend.messages
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
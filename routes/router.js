const passport = require('passport');
const bcrypt = require('bcryptjs');

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
                    username: req.body.username,
                    first_name: req.body.firstname,
                    last_name: req.body.lastname,
                    gender: req.body.gender,
                    password: bcrypt.hashSync(req.body.password, 12)
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
        console.log('user: ',req.user)

        res.render('index', {friends: req.user.friends.filter((friend) => {
            return friend.friends_status === true;
        })});
        // var io = require('../socket')();
    })

    app.get('/search/:name', (req, res) => {
        console.log(req.params.name);
        var username = req.params.name;

        Model.find({username: username}).select({password: 0, _id: 0, __v: 0, friends: 0}).exec((err, data) => {
            if(err) console.log(err);
            res.send(data);
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
                friends_status: false
            })
            console.log(req.user)
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
                friends_status: false
            })
            user.save((err, data) => {
                if(err) console.log(err);

            })
        })

        res.send('success')
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login')
    });

    app.get('/requests', (req, res) => {
        res.render('requests', {requests: req.user.friends.filter((friend) => {
            return friend.friends_status === false;
        })})
    })

    app.get('/all', (req, res) => {
        Model.find({}, (err, data) => {
            if(!err) res.send(data)
        })
    })
    app.get('/friends', (req, res) => {
        res.render('friends_list', {friends: req.user.friends.filter((friend) => {
            return friend.friends_status === true;
        })});
    })

    app.get('/rem', (req, res) => {
        Model.remove({}, (err, data) => {
            if(!err) res.send('success')
        })
    })
}
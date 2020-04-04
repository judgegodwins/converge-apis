const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

module.exports = function(app, model) {
    passport.use(new LocalStrategy(
        {usernameField: 'username'},
        (username, password, done) => {


            if(/@\w+[.][a-z]/gi.test(username)) {
                model.findOne({email: username}, (err, user) => {
                    console.log('user found: ', user)
                    if(err) return done(err);
                    if(!user) return done(null, false);
                    if(!bcrypt.compareSync(password, user.password)) return done(null, false);
        
                    return done(null, user);
                })
            } else {
                model.findOne({username: username}, (err, user) => {
                    console.log('user found: ', user)
                    if(err) return done(err);
                    if(!user) return done(null, false);
                    if(!bcrypt.compareSync(password, user.password)) return done(null, false);
        
                    return done(null, user);
                })
            }
        
        }
    ));

    function findWith(param, value, password, done) {
        console.log('param: ', param)

    }

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        model.findById(id, (err, user) => {
            if(err) return done(err);

            done(null, user);
        })
    }) 
}
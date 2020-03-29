require('dotenv').config();

const express          = require('express');
const http              = require('http');
const fs               = require('fs')
const path             = require('path');
const helmet           = require('helmet');
const bodyParser       = require('body-parser');
const socketio         = require('socket.io');
const session          = require('express-session');
const FileStore        = require('session-file-store')(session);
const passport         = require('passport');
const passportSocketIo = require('passport.socketio');
const cookieParser     = require('cookie-parser');
const webPush          = require('web-push');

const app              = express();
const PORT             = process.env.PORT || 5000;

const server           = http.Server(app)


const io               = socketio(server);
const sessionStore     = new FileStore();


app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var sess = {
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
};

if(app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}

app.use(session(sess));

app.use(passport.initialize());

app.use(passport.session());

io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}))


app.use(express.static(path.join(process.cwd(), 'public')))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


//push subscription

app.post('/subscribepush', (req, res) => {
    const subscription = req.body;
    const subToString = JSON.stringify(subscription);
    
    User.findById(req.user._id, (err, user) => {
        user.pushSubscription = JSON.stringify(subscription);
        user.save((err, data) => {
            if(err) console.error(err);
            res.send('success');
        })
    })
})


const mongoose = require('mongoose');

const routes = require('./routes/router');
const auth = require('./auth');
const socket = require('./socket').socketConnection;
const User = require('./model/User');


mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    console.log('connected');
    auth(app, User)
    routes(app, User);
    socket(io, User);
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
})

module.exports = {
    httpserver: server
}
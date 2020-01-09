const express = require('express');
const http = require('http');
const router = require('./routes/router');
var path = require('path');
const PORT = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const server = http.Server(app);
const io = socketio(server);
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const sessionStore = new FileStore();
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser')
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));
app.use(passport.initialize());
app.use(passport.session());
io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}))


app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


const mongoose = require('mongoose');

const routes = require('./routes/router');
const auth = require('./auth');
const socket = require('./socket')
const User = require('./model/User');


mongoose.connect('mongodb://localhost:27017/Users', {useNewUrlParser: true}, (err, db) => {
    console.log('connected');
    auth(app, User)
    routes(app, User);
    socket(io, User);

    server.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));
})

module.exports = {
    httpserver: server
}
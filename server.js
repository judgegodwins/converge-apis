const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./routes/router');
var path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
const helmet = require('helmet');

const server = http.createServer(app);
const io = socketio(server);
app.use(helmet.xssFilter({setOnOldIE: true}));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(router);

io.on('connection', (socket)=>{
    console.log('we have a new connection');

    socket.on('disconnect', ()=>{
        console.log("user gone")
    })
    
    socket.username = 'Anonymous'

    socket.on('new_message', (data) => {
        socket.broadcast.emit('new_message', {message: data, username: socket.username})
    })
    socket.on('change_username', function(username) {
        socket.username = username;
    })
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username: socket.username});
    })
    socket.on('stop_typing', (data) => {
        socket.broadcast.emit('stop_typing')
    })
})


server.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));

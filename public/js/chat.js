$(function() {
    var socket = io.connect('http://localhost:5000');
    $('.submit').click(function(e) {
        e.preventDefault();
        socket.emit('new_message', $('.box').val());
        $('.messages').append(`<li class="msg">${$('.box').val()}</li>`);
        $('.box').val('');
    })
    
    socket.on('new_message', function(data) {
        $('.messages').append(`<li class="msg">${data.username + ': ' + data.message}</li>`)
    })
    $('.change_username').click(function(e) {
        e.preventDefault();
        socket.emit('change_username', $('.username').val());
    })
    $('.box').bind('keypress', function() {
        socket.emit('typing')
    })
    $('.box').bind('keyup', function() {
        socket.emit('stop_typing')
    })
    
    socket.on('typing', function(data) {
        $('.t_p').html(`${data.username} is typing...`)
    })
    socket.on('stop_typing', function() {
        setTimeout(function() {
            $('.t_p').html('');
        }, 4000);
    })
})
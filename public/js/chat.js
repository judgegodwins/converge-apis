$(function() {
    var socket = io();
    
    socket.on('new_msg', function(data) {
        var msgPanel = document.querySelector('.panel');
        if(!msgPanel) {
            var person_msg = document.querySelectorAll('.msg_content');

            person_msg.forEach((x) => {
                if(x.dataset.username == data.username) {
                    x.innerHTML = data.message;
                }
            })

        } else {
            $('.messages').append(`<li class="msg msg_recieved">${data.message}</li>`)
            if(msgPanel && msgPanel.dataset.username == data.username) {
                console.log('username is true')
                // socket.emit('join', {friend: msgPanel.dataset.username})
            } 
        }
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
    socket.on('online', function(friend) {
        let friends = document.querySelectorAll('.friend_obj');
        console.log('emitted')
        console.log(friend.username);
        friends.forEach((x) => {
            console.log(x)
            console.log(x.dataset.username, ' ', friend.username);
            if(x.dataset.username == friend.username) {
                x.dataset.status = 'online'
                var msgPanel = document.querySelector('.panel');

                if(msgPanel && msgPanel.dataset.username == x.dataset.username) {
                    console.log(x.dataset.username, ' ', msgPanel.dataset.username)
                    console.log(x.dataset.status)
                    $('.activity_status').html(x.dataset.status);
                }
            }
        })
    })
    $('.joe').click(function(e) {
        e.preventDefault();
        socket.emit('private message', this.innerText);
    })
    $('.friend_obj').click(function(e) {
        socket.emit('join', {friend: this.dataset.username})
        // $('.right').css({'display': 'block'})
        let fullName = this.dataset.fullname,
            username = this.dataset.username,
            status = this.dataset.status
        $('.cover').html(`
        <div class="right panel" data-username="${this.dataset.username}">
            <div class="container">
               <div class="holder">
                  <h4>${fullName}</h4>
                  <p class"activity_status">${status}</p>
               </div>
            </div>
            <div class="message-div container">
               <ul class="messages"></ul>
            </div>

            <div class="container div-small">
                <div class="is_typing">
                    <p class="t_p"></p>

                </div>
            </div>
            <div class="text-box container">
                <form class="send_msg" action="">
                    <input class="box" type="text" required>
                    <button class="submit" type"submit">Send</button>
                </form>
            </div>
        </div>`)
        submitCall();
    })
    socket.on('typing', function(data) {
        $('.t_p').html(`${data.username} is typing...`)
    })
    socket.on('stop_typing', function() {
        setTimeout(function() {
            $('.t_p').html('');
        }, 4000);
    });
    // socket.on('connected user disconnected', function(data) {
    //     console.log(data.username)
    //     setTimeout(function() {
    //         socket.emit('join', {friend: this.dataset.username})
    //     }, 5000)
        
    // })
    function submitCall() {
        $('.submit').click(function(e) {
            e.preventDefault();
            socket.emit('new_message', $('.box').val());
            $('.messages').append(`<li class="msg msg_sent">${$('.box').val()}</li>`);
            $('.box').val('');
        })
    }
})
import {friendClick} from './grid.js'


var friendMessages = {
    'john': [
        {content: 'Hello', type: 'sent'},
        {content: 'Hi bro', type: 'received'}
    ]
}


fetch('/messages?username=*')
    .then(res => {return res.json()})
    .then((data) =>{
        console.log(data)
        console.log(friendMessages)
        var obj = Object.keys(data);
        obj.forEach((key, i) => {
            friendMessages[key] = (Object.values(data))[i]
        })

        
    });

function setCookie(cookie) {
    var cookies = document.cookie;

    let cookieArray;
    cookies.includes(';') ? cookieArray = cookies.split(';') : cookieArray = cookies.split('=');


    

    if(cookie.includes('current_joined')) {
        for (let i = 0; i < cookie.length; i++) {
            
        }
    }
}

$(function() {

    var socket = io();
    var chatArea = document.querySelector('.chat-area')
    var existMsg = chatArea.innerHTML

    friendClick();

    var newMessage = (text, elclass, time) => {
        let returnMsg = `
            <div class="message-row ${elclass}">
                <div class="message-text">
                    ${text}
                </div>
                <div class="message-time">
                    <span class="time">${time}</span>
                    <span>
                        ${elclass == 'you-message' ? '<i class="fas fa-check"></i>' : ''}
                    </span>
                </div>
            </div>
        `;
        return returnMsg;
    };

    function submitCall(friend) {
        $('.submit').click(function(e) {

            e.preventDefault();

            let msg = $('#message-box').val();

            if(msg == '') return;

            socket.emit('new_message', {message: msg, toUser: friend});

            var msgInd = friendMessages[friend];
            msgInd.push({content: msg, type: 'sent'})
            $('.msg-span').html(msgInd[msgInd.length-1].content)


            chatArea.innerHTML = newMessage(msg, 'you-message', null) + chatArea.innerHTML;
            $('#message-box').val('');
        })
    }



    socket.on('new_msg', function(data) {

        console.log(data.message)
  
        chatArea.innerHTML = newMessage(data.message, 'other-message', null) + chatArea.innerHTML;
        var msgInd = friendMessages[data.username]
        msgInd.push({content: data.message, type: 'received'})

        $('.msg-span').html(msgInd[msgInd.length-1].content)

        socket.emit('save_message', {message: data.message, username: data.username})

    })

    $('.message').click(function(e) {
        let friendUsername = this.dataset.username
        socket.emit('join', {friend: friendUsername});
        submitCall(this.dataset.username);
        chatArea.innerHTML = '';

        $('#header-username').data('username', this.dataset.username)

        document.cookie = `current_joined=${this.dataset.username}`

        friendMessages[friendUsername].forEach((msg) => {
            let elClass;
            if(msg.type == 'sent') {
                elClass = 'you-message';
            } else {
                elClass = 'other-message';
            }

            // chatArea.append(newMessage(msg.content, elClass, null))
            chatArea.innerHTML = newMessage(msg.content, elClass, null) + chatArea.innerHTML;

        })

    })

    socket.on('online', (friend) => {
        var t = document.cookie;
        if(friend.username === t.substring(t.indexOf('=')+1)) {
            socket.emit('join', {friend: friend.username});
        }
    })
})
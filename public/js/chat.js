import {friendClick} from './grid.js'

console.log(friendClick)



function setCookie(cookie) {
    var cookies = document.cookie;

    let cookieArray;
    cookies.includes(';') ? cookieArray = cookies.split(';') : cookieArray = cookies.split('=');


    

    if(cookie.includes('current_joined')) {
        for (let i = 0; i < cookie.length; i++) {
            
        }
    }
}

function getPermission() {
    if(!('Notification' in window)) {
        return;
    } else {
        Notification.requestPermission(status => {
            console.log('notification status: ', status);
        })    
    }
}

$(function() {

    var friendMessages = {
        'john': {
            activeStatus: null,
            messages: [
                {content: 'Hello', type: 'sent'},
                {content: 'Hi bro', type: 'received'}
            ]
        }
    
    }
    
    
    function newPerson(person) {
        return `
             <div class="message" data-img="/src/img/download.png" data-username="${person.username}">
                 <div class="image-div">
                     <img class="friend-avatar" src="/src/img/download.png" alt="image of friend" srcset="" />
                 </div>
                 <div class="msg-text-name">
                     <div class="friend-name">
                         <span id="username">${person.fullname ? person.fullname : person.first_name + ' ' + person.last_name}</span>
                     </div>
                     <div class="msg-content">
                         <span class="msg-span" data-username="${person.username}">${friendMessages[person.username] ? friendMessages[person.username].messages[friendMessages[person.username].messages.length-1].content : '@' + person.username}
                         <span class="read-status" style="font-size: lighter;">
                            <i class="fas fa-check"></i>
                        </span>
                         </span>
                     </div>
                 </div>
             </div>
         `
     }


    fetch('/messages?username=*')
        .then(res => {return res.json()})
        .then((data) =>{
            console.log('data: ', data)
            console.log('bring friendMessages: ', friendMessages)
            var obj = Object.keys(data);
            friendMessages = data;
            obj.forEach((key, i) => {
                console.log('key: ', key);
                friendMessages[key].activeStatus = null
                $('.messages-div').append(newPerson(friendMessages[key]));
            })
            friendClick();
            console.log('friendmessages from fetch: ', friendMessages)
            $('.message').click(messageClick)
        });
    friendClick();

    var socket = io();
    var chatArea = document.querySelector('.chat-area')
    var existMsg = chatArea.innerHTML

    var newMessage = (text, elclass, time) => {
        let returnMsg = `
            <div class="message-row ${elclass}">
                <div class="message-text">
                    ${text}
                </div>
                <div class="message-time">
                    <span class="time">${time}</span>
                    <span class="read-status">
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

            socket.emit('new_message', {message: msg, toUser: friend, fullName: $('#header-username').html()});

            try {
                var msgInd = friendMessages[friend].messages;
                msgInd.push({content: msg, type: 'sent'})

                var msgSpan = document.querySelectorAll('.msg-span');
                console.log('message: ', msgSpan)
                msgSpan.forEach((ms) => {
                    if(ms.dataset.username === friend) {
                        ms.innerHTML = msgInd[msgInd.length-1].content + 
                        `<span class="read-status" style="font-size: lighter;">
                            <i class="fas fa-check"></i>
                        </span>`
                    }
                })

            } catch (err) {

            }

            console.log(friendMessages);

            chatArea.innerHTML = newMessage(msg, 'you-message', null) + chatArea.innerHTML;
            $('#message-box').val('');
        })
    }


    socket.on('add_new_messages', (data) => {
        console.log('add_new_messages data: ', data);
    })

    socket.on('new_msg', function(data) {

        let u = document.getElementById('header-username');
        if(u.dataset.username == data.username) {
            chatArea.innerHTML = newMessage(data.message, 'other-message', null) + chatArea.innerHTML;
            let mainArea = document.querySelector('.main-area');
            if(mainArea.classList.contains('active-area')) {
                socket.emit('read', {username: $('.container').data('user')})
            }
        }
        
        socket.emit('delivered', {receivingUser: $('.container').data('user'), otherUser: data.username})

        var msgInd = friendMessages[data.username].messages
        msgInd.push({content: data.message, type: 'received'})

        var msgSpan = document.querySelectorAll('.msg-span');
        
        msgSpan.forEach((ms) => {
            console.log('message span', ms);
            console.log(ms.dataset.username)
            if(ms.dataset.username === data.username) {
                console.log('msgSpan: ', ms);
                ms.innerHTML = msgInd[msgInd.length-1].content
            }
        })


        socket.emit('save_message', {message: data.message, username: data.username})

    })


    socket.on('add_new_messages', (data) => {
        console.log('add_new_messages data: ', data);
    })


    function getReadStatus(readSt) {
        socket.on(readSt, (data) => {
            let msg = document.querySelectorAll('.msg-span');
            
            console.log(msg)
    
            msg.forEach((target) => {
                if(target.dataset.username === data.username) {
                    console.log('children[0]: ', target.children[0].children[0]);
                    target.children[0].children[0].classList.remove('fa-check');
                    target.children[0].children[0].classList.add('fa-check-double');
                    if(readSt == 'read') target.children[0].children[0].style.color = '#0f0';
                }
            })
    
        })
    }

    // getReadStatus('read');
    // getReadStatus('delivered')



    function messageClick(e) {
        $('.search-box').addClass('inactive');
        console.log('calling message click');
        let friendUsername = this.dataset.username;
        socket.emit('join', {friend: friendUsername});
        submitCall(this.dataset.username);
        chatArea.innerHTML = '';
        console.log('data username: ', this.dataset.username);
        // friendClick();
        let span = document.querySelector('#header-username');
        span.dataset.username = this.dataset.username;

        document.cookie = `current_joined=${friendUsername}`

        function bringStatus(username) {
            socket.emit('bring_status', {username: username}, (status, fromDb) => {
                console.log('bringing status')
                console.log('status: ', status)
                if(status != 'online') {
                    let lastSeen = `last seen ${parseDate(status)}`
                    $('#lastseen').html(lastSeen);
                    try {
                        friendMessages[friendUsername].activeStatus = lastSeen;
                        console.log('lastSeen FriendMessages: ', friendMessages)
                    } catch(err) {
                        return;
                    }
                } else {
                    $('#lastseen').html(status) 
                }
            });
        }

        socket.emit('read', {username: $('.container').data('user')});

        if(friendMessages[friendUsername]) {

            if(friendMessages[friendUsername].activeStatus) {

                $('#lastseen').html(friendMessages[friendUsername].activeStatus);

            } else {
                bringStatus(this.dataset.username);
            }

        } else {
            bringStatus(this.dataset.username);
        }

        try {
            friendMessages[friendUsername].messages.forEach((msg) => {
                let elClass;
                if(msg.type == 'sent') {
                    elClass = 'you-message';
                } else {
                    elClass = 'other-message';
                }
    
                chatArea.innerHTML = newMessage(msg.content, elClass, null) + chatArea.innerHTML;
    
            })
        } catch (err) {

        }

        getPermission();
        

    }
    $('.message').click(messageClick);


    socket.on('online', (friend) => {
        var t = document.cookie;
        if(friend.username === t.substring(t.indexOf('=')+1)) {
            socket.emit('join', {friend: friend.username});
        }
    })

    socket.on('connected', (data) => {
        let ls;
        try {
            ls = friendMessages[data.username].activeStatus = `${data.status}`;
        } catch (err) {
            ls = data.status
        }

        if ($('#header-username').data('username') == data.username) {
            $('#lastseen').html(ls);
        }

    })



    socket.on('disconnected', (data) => {
        try {
            let ls = friendMessages[data.username].activeStatus = `last seen ${parseDate(data.time)}`
            console.log(friendMessages);
            $('#lastseen').html(ls);
        } catch (err) {
            if($('#header-username').data('username') == data.username) {
                $('#lastseen').html(`last seen ${parseDate(data.time)}`)
            }
        }
    })


    $('.search-txt').on('keyup', function () {
        if(this.value.trim() == '') return;
        var url = new URL(`${window.location.origin}/search`),
            params = {username: this.value.toLowerCase()}
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key])
        })
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                $('.search-div').html('');
                console.log(data);
                let goodData = data.filter((x) => {
                    return x.username != $('.container').data('user')
                })
                console.log('good data: ', goodData)
                goodData.forEach((person) => {
                    $('.search-div').append(newPerson(person))
                })

                friendClick();
                $('.message').click(messageClick);
            })
    })

    $('.search-btn').click(function() {
        console.log('click search-btn')
        console.log(this.innerHTML);
        if(this.children[0].classList.contains('fa-arrow-left')) {
            this.innerHTML = '<i class="fas fa-search"></i>';
            $('.search-div').addClass('inactive-left');
            $('.search-div').removeClass('active-left');
            $('.messages-div').addClass('active-left');
            $('.messages-div').removeClass('inactive-left');
        } else {
            this.innerHTML = '<i class="fas fa-arrow-left"></i>';
            $('.messages-div').addClass('inactive-left');
            $('.messages-div').removeClass('active-left');
            $('.search-div').addClass('active-left');
            $('.search-div').removeClass('inactive-left');
        }
        $('.search-txt').toggleClass('active');
    })
})

function parseDate(d) {
    let date = new Date(d);
    let currentDate = new Date();
    let prefix = ''

    let dateArray = date.toString().split(' ');

    let dateDiff = currentDate.getDate() - date.getDate()
    if(dateDiff === 0) {
        prefix = 'today at'    
    } else if(dateDiff === 1) {
        prefix = 'yesterday at'
    } else if(dateDiff >= 1 && dateDiff < 7) {
        console.log(dateDiff)
        prefix = dateArray[0] + ' at'
    } else if (dateDiff >= 7){
        console.log('im here last week')
        prefix = dateArray[1] + ' ' + dateArray[2] + ' at';
    }

    return `${prefix} ${(toString(date.getHours()).length)<2 ? '0' : ''}${date.getHours()}:${(toString(date.getMinutes()).length)<2 ? '0' : ''}${date.getMinutes()}`;
}
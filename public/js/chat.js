import {friendClick} from './grid.js'

// function setCookie(cookie) {
//     var cookies = document.cookie;

//     let cookieArray;
//     cookies.includes(';') ? cookieArray = cookies.split(';') : cookieArray = cookies.split('=');


    

//     if(cookie.includes('current_joined')) {
//         for (let i = 0; i < cookie.length; i++) {
            
//         }
//     }
// }

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

    var friendMessages = {}
    var cacheMsgInBox = {};
    
    function newPerson(person) {
        let iconTrue
        if(friendMessages[person.username] && friendMessages[person.username].messages[friendMessages[person.username].messages.length-1].type == 'sent') {
            iconTrue = '<i class="fas fa-check"></i>' 
        } else {
            iconTrue = ''
        }
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
                         ${iconTrue}
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
    var existMsg = chatArea.innerHTML;
    let submit = document.querySelector('.submit');
    let messageBox = document.getElementById('message-box')

    var newMessage = (text, elclass, time) => {
        const now = new Date();
        const nowArray = now.toString().split(' ');
        if(elclass == 'you-message' && !time) {
            time = nowArray[4].substring(0, nowArray[4].lastIndexOf(':'))
        }

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

    function submitCall() {
        $('.submit').click(function(e) {

            e.preventDefault();

            let friend = this.dataset.username;

            let msg = $('#message-box').val();

            if(msg == '') return;


            socket.emit('new_message', {message: msg, toUser: friend, fullName: $('#header-username').html()});

            let msgInd;

            if(friend in friendMessages) {
                console.log(friend, ' in friendMessages')
                msgInd = friendMessages[friend].messages;
                msgInd.push({content: msg, type: 'sent', time: new Date().toISOString()})

                var msgSpan = document.querySelectorAll('.msg-span');

                msgSpan.forEach((ms) => {
                    if(ms.dataset.username === friend) {
                        ms.innerHTML = msgInd[msgInd.length-1].content + 
                        `<span class="read-status" style="font-size: lighter;">
                            <i class="fas fa-check"></i>
                        </span>`
                    }
                })
            } else {
                
                friendMessages[friend] = {
                    fullname: $('#header-username').html(),
                    username: friend,
                    messages: [{content: msg, type: 'sent', time: new Date().toISOString()}]
                }

                msgInd = friendMessages[friend].messages

                var msgDiv = document.querySelector('.messages-div');
 
                msgDiv.innerHTML = newPerson(friendMessages[friend]) + msgDiv.innerHTML
                friendClick();
                $('.message').click(messageClick);
            }


            // let lastMsgTime = msgInd[msgInd.length-1].time
            // let chatarea = document.querySelector('.chat-area');
            // let msgDay = document.querySelector('.msg-day')
            // if(parseDate(lastMsgTime).minusTime.trim() == 'today') {
            //     if(!chatArea.contains(msgDay)) {
            //         chatArea.innerHTML = '<div class="msg-day">Today</div>' + chatArea.innerHTML;            
            //     }
            // } else {
            //     chatArea.innerHTML = '<div class="msg-day">Today</div>' + chatArea.innerHTML;            

            // }

            // console.log(friendMessages);

            chatArea.innerHTML = newMessage(msg, 'you-message', '') + chatArea.innerHTML;
            $('#message-box').val('');
        })
    }


    socket.on('add_new_messages', (data) => {
        console.log('add_new_messages data: ', data);
    })

    socket.on('new_msg', function(data) {
        const newMsgObj = {content: data.message, type: 'received', time: new Date().toISOString()};
        let u = document.getElementById('header-username');
        if(u.dataset.username == data.username) {
            chatArea.innerHTML = newMessage(data.message, 'other-message', parseDate(newMsgObj.time).hour) + chatArea.innerHTML;
            let mainArea = document.querySelector('.main-area');
            if(mainArea.classList.contains('active-area')) {
                socket.emit('read', {username: $('.container').data('user')})
            }
        }
        
        socket.emit('delivered', {receivingUser: $('.container').data('user'), otherUser: data.username})

        if(!(data.username in friendMessages)) {
            console.log('data fullname: ', data.fullname)
            friendMessages[data.username] = {
                fullname: data.fullname,
                username: data.username,
                messages: [newMsgObj]
            }
            console.log('user not in friendmessages')
            let messageDiv = document.querySelector('.messages-div');

            messageDiv.innerHTML = newPerson(
                friendMessages[data.username]
            ) + messageDiv.innerHTML;
            
            friendClick();  
            $('.message').click(messageClick);
        } else {
            var msgInd;
            msgInd = friendMessages[data.username].messages;
            msgInd.push(newMsgObj);

            var msgSpan = document.querySelectorAll('.msg-span');
            
            msgSpan.forEach((ms) => {
                console.log('message span', ms);
                console.log(ms.dataset.username)
                if(ms.dataset.username === data.username) {
                    console.log('msgSpan: ', ms);
                    ms.innerHTML = msgInd[msgInd.length-1].content
                }
            })
        }


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


    messageBox.addEventListener('keyup', (e) => {

        let username = messageBox.dataset.username;
        cacheMsgInBox[username] = messageBox.value;

    })

    function messageClick(e) {
        $('.search-box').addClass('inactive');
        let friendUsername = this.dataset.username;

        socket.emit('join', {friend: friendUsername});
        
        //important
        chatArea.innerHTML = '';

        let span = document.querySelector('#header-username');
        span.dataset.username = friendUsername;
        document.cookie = `current_joined=${friendUsername}`


        submit.dataset.username = friendUsername;
        messageBox.dataset.username = friendUsername
        if(friendUsername in cacheMsgInBox) {
            messageBox.value = cacheMsgInBox[friendUsername]
        } else {
            messageBox.value = '';
        }

        submitCall();

        function bringStatus(username) {
            socket.emit('bring_status', {username: username}, (status, fromDb) => {
                console.log('bringing status')
                console.log('status: ', status)
                if(status != 'online') {
                    let lastSeen = `last seen ${parseDate(status).prefixTime}`
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

        if(friendUsername in friendMessages) {

            if(friendMessages[friendUsername].activeStatus) {

                $('#lastseen').html(friendMessages[friendUsername].activeStatus);

            } else {
                bringStatus(this.dataset.username);
            }

        } else {
            bringStatus(this.dataset.username);
        }

        if(friendUsername in friendMessages) {
            let dateOfMsg, at;
            friendMessages[friendUsername].messages.forEach((msg) => {
                let elClass;
                if(msg.type == 'sent') {
                    elClass = 'you-message';
                } else {
                    elClass = 'other-message';
                }

                dateOfMsg = msg.time;

                let minusTime = parseDate(dateOfMsg).minusTime;

                if(minusTime.trim() == 'today') {
                    if(at != 'today') {

                        chatArea.innerHTML = '<div class="msg-day">Today</div>' + chatArea.innerHTML;

                    }
                    at = 'today';
                } else if (minusTime.trim() == 'yesterday') {

                    if(at != 'yesterday') {
                        chatArea.innerHTML = '<div class="msg-day">Yesterday</div>' + chatArea.innerHTML
                    }
                    at = 'yesterday';

                } else {
                    if(at != minusTime) {

                        chatArea.innerHTML = `<div class="msg-day">${minusTime}</div>` + chatArea.innerHTML;
                        
                    }
                    at = minusTime;
                }
    
                chatArea.innerHTML = newMessage(msg.content, elClass, parseDate(msg.time).hour) + chatArea.innerHTML;
    
            })
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
        console.log('connected: ', data.username, data.status)
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
            let ls = friendMessages[data.username].activeStatus = `last seen ${parseDate(data.time).prefixTime}`
            console.log(friendMessages);
            $('#lastseen').html(ls);
        } catch (err) {
            if($('#header-username').data('username') == data.username) {
                $('#lastseen').html(`last seen ${parseDate(data.time).prefixTime}`)
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
    let prefix = '', sub = '';

    let dateArray = date.toString().split(' ');

    let dateDiff = currentDate.getDate() - date.getDate()
    if(dateDiff === 0) {
        prefix = 'today at'
    } else if(dateDiff === 1) {
        prefix = 'yesterday at'
    } else if(dateDiff >= 1 && dateDiff < 7) {

        prefix = dateArray[0] + ' at'
        sub = `${dateArray[1]} ${dateArray[2]} ${dateArray[3]}` 
    } else if (dateDiff >= 7){

        prefix = dateArray[1] + ' ' + dateArray[2] + ' at';
        console.log('prefix: ', prefix);
        sub = `${dateArray[3]}`
        console.log(prefix)
    }

    const time = dateArray[4].substring(0, dateArray[4].lastIndexOf(':'));
    return ({
        prefixTime: `${prefix} ${time}`,
        minusTime: `${prefix.substring(0, prefix.lastIndexOf('a'))} ${sub ? sub : ''}`,
        hour: `${time}`
    })
}
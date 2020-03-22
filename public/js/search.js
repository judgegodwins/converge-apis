// import {friendMessages} from './chat.js'

// $(function() {
    // var addfriend;
    // $('.search_friend').click(function(e) {
    //     e.preventDefault();

    //     console.log('clicked')
    //     customAjax(`/search/${$('#search').val()}`, 'GET', null, function(res) {
    //         var people = JSON.parse(res);
    //         for(let item of people) {
    //             $('.results').html('');
    //             $('.results').append(`<div class="item">
    //             <h3 class="name"> ${item.first_name + ' ' +item.last_name}</h3>
    //             <p class="username">@${item.username}</p>
    //             <button class="addfriend" data-username="${item.username}">Add Friend</button>
    //             </div>`)
    //         }
    //         addfriend = document.querySelectorAll('.addfriend')
    //         addfriend.forEach((btn) => {
    //             btn.addEventListener('click', function(e) {
    //                 e.preventDefault();
    //                 customAjax(`/friend_reque st/${this.dataset.username}`,
    //                  'GET',
    //                  null,
    //                 function(response) {
    //                     console.log(response)
    //                     $('.addfriend').html('pending');
    //                 })
    //             })
    //         })
    //         console.log(people)
    //     })
    // })

//     $('.search').on('keyup', function () {
//         $('.messages-div').addClass('inactive-left');
//         $('.messages-div').removeClass('active-left');
//         $('.search-div').addClass('active-left');
//         $('.search-div').removeClass('inactive-left');

//         fetch(`/search/${this.value}`)
//             .then(res => res.json())
//             .then(data => {
//                 $('.search-div').html('');
//                 console.log(data);
//                 data.forEach((person) => {
//                     $('.search-div').append(`
//                         <div class="message" data-img="/src/img/download.png" data-username="">
//                             <div class="image-div">
//                                 <img class="friend-avatar" src="/src/img/download.png" alt="image of friend" srcset="" />
//                             </div>
//                             <div class="msg-text-name">
//                                 <div class="friend-name">
//                                     <span id="username">${person.first_name + ' ' + person.last_name}</span>
//                                 </div>
//                                 <div class="msg-content">
//                                     <span class="msg-span">${friendMessages[person.username] ? friendMessages[person.username].messages[friendMessages[person.username].messages.length-1] : '@' + person.username}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     `)
//                 })
//             })
//     })


// })


// export function customAjax(url, method, wts, callback) {
//     var req = new XMLHttpRequest();

//     req.open(method, url);
//     console.log('trying...')
//     if(method == 'POST') {
//         console.log('trying post')
//         req.setRequestHeader('Content-Type', 'application/json;charsetUTF-8');
//         req.send(JSON.stringify(wts));
//     }
//     req.onreadystatechange = function() {
//         if(req.readyState === 4 && req.status === 200) {
//             let response = req.responseText;
//             callback(response)
//         }
//     }
//     req.send(null)
// }
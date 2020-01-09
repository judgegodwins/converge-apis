

$(function() {
    var addfriend;
    $('.search_friend').click(function(e) {
        e.preventDefault();

        console.log('clicked')
        customAjax(`/search/${$('#search').val()}`, 'GET', null, function(res) {
            var people = JSON.parse(res);
            for(item of people) {
                $('.results').html('');
                $('.results').append(`<div class="item">
                <h3 class="name"> ${item.first_name + ' ' +item.last_name}</h3>
                <p class="username">@${item.username}</p>
                <button class="addfriend" data-username="${item.username}">Add Friend</button>
                </div>`)
            }
            addfriend = document.querySelectorAll('.addfriend')
            addfriend.forEach((btn) => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    customAjax(`/friend_request/${this.dataset.username}`,
                     'GET',
                     null,
                    function(response) {
                        console.log(response)
                        $('.addfriend').html('pending');
                    })
                })
            })
            console.log(people)
        })
    })


})


export function customAjax(url, method, wts, callback) {
    var req = new XMLHttpRequest();

    req.open(method, url);
    console.log('trying...')
    if(method == 'POST') {
        console.log('trying post')
        req.setRequestHeader('Content-Type', 'application/json;charsetUTF-8');
        req.send(JSON.stringify(wts));
    }
    req.onreadystatechange = function() {
        if(req.readyState === 4 && req.status === 200) {
            let response = req.responseText;
            callback(response)
        }
    }
    req.send(null)
}
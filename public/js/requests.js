$(function() {
    const socket = io('/requests');
    
    $('.confirm_req').click(function() {
        socket.emit('confirm request', this.dataset.username);
        async function wait() {
            await socket.on('confirmed', function(data) {
                this.innerText = 'Friends'
            })
        }
        wait()
    })

})
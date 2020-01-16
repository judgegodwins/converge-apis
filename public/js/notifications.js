$('.notify').click(function(e) {
    console.log('clicked...')
    e.preventDefault();
    notifyMe();
})
function notifyMe() {
    if(!('Notification' in window)) {
        alert('notification isn\'t enabled');
    } else if(Notification.permission === 'granted') {
        var notification = new Notification('Hi there');
    } else if(Notification.permission !== 'denied') {
        Notification.requestPermission().then(function() {
            if(Notification.permission === 'granted') {
                var notification = new Notification('Hi there');
            }
        })
    }
}
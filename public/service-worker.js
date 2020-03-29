// const cacheName = 'cache-v1';

// const precacheResources = [
//     '/',

// ]


self.addEventListener('install', function(event) {
    console.log('sw installed')
})

self.addEventListener('notificationclick', event => {
    const notification = event.notification,
          action       = event.action
    
    if(action == 'close') {
        notification.close();
    } else {
        clients.openWindow('/')
        notification.close();
    }
}) 

self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.message,
        icon: '/src/img/download.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now()
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );

})
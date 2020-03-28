const app = (() => {
  let swReg;

  const publicVapidKey = 'BOrQPL1CeyjJNJydzDcDjUozdvYjJFCeZLPUgvtl3Bp33kgUFzd8lvuvs79hFdgpbSPjb9N_kTDq265juEbPGLk';

  if(!('Notification' in window)) {
    return;
  }

  function subscribeUser(reg) {
    const appServerKey = urlB64ToUint8Array(publicVapidKey);
    reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey
    })
    .then(subscription => {
      console.log('created subscription')
      console.log('subscription: ', subscription);
      updateSubOnServer(subscription);
    })
    .catch(err => {
      if(Notification.permission === 'denied') {
        console.warn('Notification permission is denied');
      } else {
        console.error('failed to subscribe: ', err);
      }
    })
  }

  function unsubscribeUser(reg) {
    reg.pushManager.getSubscription()
    .then(subscription => {
      if(subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(err => {
      console.log('error unsubscribing: ', err);
    })
    .then(() => {
      console.log('successfully unsubscribed')
    })
  }

  function updateSubOnServer(subscription) {
    fetch(`${document.location.origin}/subscribepush`, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }                                           
    });
  }

  if('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('../service-worker.js', {
          scope: '/'
        })
          .then(reg => {
            console.log('service worker registered')
            swReg = reg;

            // re.update();

            reg.pushManager.getSubscription()
            .then(subscription => {
              if(subscription) {

                console.log('updating on server')
                updateSubOnServer(subscription);
                console.log('there\'s subscription');

              } else {
                console.log('no subscription');
                subscribeUser(reg);
              }
            })
          })
          .catch(err => {
            console.log('service worker reg failed ', err);
          })
      });
  }


  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

})()


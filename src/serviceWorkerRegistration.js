// Registra el Service Worker per fer l'app funcionar offline (PWA)

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
      } else {
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[PWA] Nova versió disponible.');
            } else {
              console.log('[PWA] App guardada per a ús offline.');
            }
          }
        };
      };
    })
    .catch(error => console.error('[PWA] Error registrant SW:', error));
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType && !contentType.includes('javascript'))) {
        navigator.serviceWorker.ready.then(r => r.unregister()).then(() => window.location.reload());
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => console.log('[PWA] Sense connexió. App en mode offline.'));
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(r => r.unregister())
      .catch(err => console.error(err.message));
  }
}

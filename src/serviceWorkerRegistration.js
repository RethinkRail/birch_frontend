/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/18/2024, Wednesday
 * Description:
 **/


// src/serviceWorkerRegistration.js

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
        /^127(?:\.[0-9]+){3}$/
    )
);

export function register() {
    if ('serviceWorker' in navigator) {
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;

            if (isLocalhost) {
                checkValidServiceWorker(swUrl);
                navigator.serviceWorker.ready.then(() => {
                    console.log('Service worker ready on localhost');
                });
            } else {
                registerValidSW(swUrl);
            }
        });
    }
}

function registerValidSW(swUrl) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            console.log('Service worker registered');
        })
        .catch((error) => {
            console.error('Error during service worker registration:', error);
        });
}

function checkValidServiceWorker(swUrl) {
    fetch(swUrl)
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                registerValidSW(swUrl);
            }
        })
        .catch(() => {
            console.log('No internet connection. App is running in offline mode.');
        });
}

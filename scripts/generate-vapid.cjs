const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Generated new VAPID Keys');
console.log('----------------------------------------');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('----------------------------------------');
console.log('👉 Copy these lines to your .env.local file');

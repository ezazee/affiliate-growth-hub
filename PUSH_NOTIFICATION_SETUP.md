# Environment Variables for Push Notifications

Add these variables to your `.env.local` file:

```bash
# Push Notification VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BILYQ98tlwWNaQr4pMx3D42k9gQ8raElNIhXU9OCTElnegaZF_sroUPocViXF2poTp6e3tktTMb5UgJdNbOm2MQ
VAPID_PRIVATE_KEY=XB7EyQM7fuKlSUl2xaOnIvTUq2LfiEa_8eMLv-7Qu4g
```

## VAPID Keys

The VAPID keys are used for web push authentication. The keys above were generated for this project. For production:

1. Generate new VAPID keys: `npx web-push generate-vapid-keys`
2. Replace the keys in your environment variables
3. Update the `mailto:` address in the API routes to your admin email

## Service Worker

The system uses two service worker files:
- `public/sw.js` - Main service worker (PWA)
- `public/push-sw.js` - Push notification extension

Both are automatically registered by the PWA configuration.

## Browser Support

Push notifications work on:
- ✅ Chrome (Android & Desktop)
- ✅ Firefox (Desktop)
- ✅ Safari (iOS 16.4+, macOS 13+)
- ❌ Older iOS Safari versions

## Testing

Use the built-in tester component or test manually:

```javascript
// Test via API
fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Notification',
    body: 'This is a test',
    url: '/'
  })
});
```

## Troubleshooting

1. **Notifications not working on iOS**: Make sure you're using iOS 16.4+ and have added the website to your home screen
2. **Permission denied**: Check browser notification settings
3. **Service worker not registered**: Check browser console for errors
4. **VAPID errors**: Verify keys are correctly set in environment variables
// node test-push.mjs "ExponentPushToken[xxxx]"
const token = process.argv[2];
if (!token) throw new Error('Pass the Expo push token as an argument');

const send = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
        to: token,
        title: 'Direct test',
        body: 'If you see this, Expo → FCM → device works',
        sound: 'default',
        channelId: 'orders',
        priority: 'high',
    }),
});
const sendJson = await send.json();
console.log('TICKET:', JSON.stringify(sendJson, null, 2));

const id = sendJson?.data?.id;
if (!id) process.exit(1);

console.log('Waiting 20s for receipt...');
await new Promise(r => setTimeout(r, 20000));

const rec = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ids: [id] }),
});
console.log('RECEIPT:', JSON.stringify(await rec.json(), null, 2));
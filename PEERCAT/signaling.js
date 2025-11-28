// signaling.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const clients = new Map();
function broadcastPeers() {
  const peers = Array.from(clients.keys());
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'peers', peers }));
  }
}
wss.on('connection', ws => {
  let myId = null;
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'hello' && data.id) {
        myId = data.id; clients.set(myId, ws); broadcastPeers();
      } else if (data.type === 'signal' && data.to) {
        const dest = clients.get(data.to);
        if (dest && dest.readyState === WebSocket.OPEN) dest.send(JSON.stringify({ type:'signal', from: data.from, data: data.data }));
      }
    } catch(e){}
  });
  ws.on('close', () => { if (myId) clients.delete(myId); broadcastPeers(); });
});
console.log('Signaling server started');

const { WebSocket, Server } = require('isomorphic-ws');

const server = new Server({ port: 8080 });

server.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
  });
  ws.send('ho!');
});

const url = 'ws://localhost:8080';
const connection = new WebSocket(url);

connection.onopen = () => {
  connection.send('hey');
};

connection.onerror = (error) => {
  console.log(`WebSocket error:`, error);
};

connection.onmessage = (e) => {
  console.log(e.data);
};

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const port = 3000;
const publicDir = path.join(__dirname, '../public')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('New socket.io connection!')

  socket.emit('message', 'Welcome to the chat room!')

  socket.on('sendMessage', (newMsg) => {
    io.emit('message', newMsg)
  })
})

server.listen(port, () => {
  console.log('Server is up on port', port)
});
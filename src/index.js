const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/message')

const port = 3000;
const publicDir = path.join(__dirname, '../public')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('New socket.io connection!')

  socket.emit('message', generateMessage('Welcome to the chat room!'))

  socket.broadcast.emit('message', generateMessage('A new user has joined!'))

  socket.on('sendMessage', (newMsg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(newMsg)) {
      cb('Profanity is not allowed!')
    } else {
      io.emit('message', generateMessage(newMsg));
      cb()
    }
  })

  socket.on('sendLocation', (location, cb) => {
    const { latitude, longitude } = location;
    if (latitude && longitude) {
      io.emit('locationMessage', generateLocation(`https://google.com/maps?q=${latitude},${longitude}`))
      cb()
    } else {
      cb('Invalid location!')
    } 
  })

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left the chat room!'))
  })
})

server.listen(port, () => {
  console.log('Server is up on port', port)
});
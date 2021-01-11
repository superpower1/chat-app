const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = 3000;
const publicDir = path.join(__dirname, '../public')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('New socket.io connection!')

  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room })

    if (error) {
      return cb(error)
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome to the chat room!'))

    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    cb()
  })

  socket.on('sendMessage', (newMsg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(newMsg)) {
      cb('Profanity is not allowed!')
    } else {
      const { username, room } = getUser(socket.id);
      io.to(room).emit('message', generateMessage(username, newMsg));
      cb()
    }
  })

  socket.on('sendLocation', (location, cb) => {
    const { latitude, longitude } = location;
    if (latitude && longitude) {
      const { username, room } = getUser(socket.id);
      io.to(room).emit('locationMessage', generateLocation(username, `https://google.com/maps?q=${latitude},${longitude}`))
      cb()
    } else {
      cb('Invalid location!')
    } 
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat room!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log('Server is up on port', port)
});
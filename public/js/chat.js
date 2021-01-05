const socket = io();

socket.on('message', (msg) => {
  console.log(msg)
})

document.querySelector('#chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const chatInput = e.target.elements.message;
  const newMsg = chatInput.value;
  
  socket.emit('sendMessage', newMsg);
  e.target.reset();
})
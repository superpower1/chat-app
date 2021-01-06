const socket = io();

const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#share-geo-btn');

socket.on('message', (msg) => {
  console.log(msg)
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormBtn.setAttribute('disabled', true);

  const chatInput = e.target.elements.message;
  const newMsg = chatInput.value;
  
  socket.emit('sendMessage', newMsg, (error) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Message is delivered!')
    }
    $messageFormBtn.removeAttribute('disabled')
  });
  $messageFormInput.value = '';
})

$sendLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    $sendLocationBtn.setAttribute('disabled', true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { longitude, latitude } = position.coords;
      socket.emit('sendLocation', { longitude, latitude }, (error) => {
        if (error) {
          console.log(error)
        } else {
          console.log('Location shared!')
        }
        $sendLocationBtn.removeAttribute('disabled')
      })
    })
  } else {
    alert('Geolocation is not supported by your browser!')
  }
})
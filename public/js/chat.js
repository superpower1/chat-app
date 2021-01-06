const socket = io();

const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#share-geo-btn');
const $messageContainer = document.querySelector('#message-container');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', ({ text, createdAt }) => {
  $messageContainer.insertAdjacentHTML('beforeend', Mustache.render(messageTemplate, { message: text, time: moment(createdAt).format('hh:mm a DD MMM YYYY') }))
})

socket.on('locationMessage', ({ url, createdAt }) => {
  $messageContainer.insertAdjacentHTML('beforeend', Mustache.render(locationTemplate, { href: url, time: moment(createdAt).format('hh:mm a DD MMM YYYY') }))
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
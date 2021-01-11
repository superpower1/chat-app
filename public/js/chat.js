const socket = io();

const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#share-geo-btn');
const $messageContainer = document.querySelector('#messages');
const $sidebarContainer = document.querySelector('#sidebar');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  const $newMessage = $messageContainer.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messageContainer.offsetHeight;

  const containerHeight = $messageContainer.scrollHeight;

  const scrollOffset = $messageContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight
  }
}

socket.on('message', ({ username, text, createdAt }) => {
  $messageContainer.insertAdjacentHTML('beforeend', Mustache.render(messageTemplate, {
    name: username,
    message: text, 
    time: moment(createdAt).format('hh:mm a DD MMM YYYY') 
  }))
  autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
  $messageContainer.insertAdjacentHTML('beforeend', Mustache.render(locationTemplate, { 
    name: username,
    href: url, 
    time: moment(createdAt).format('hh:mm a DD MMM YYYY') 
  }))
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  $sidebarContainer.innerHTML = Mustache.render(sidebarTemplate, {
    room,
    users
  })
})

socket.emit('join', { username, room }, (error) => {

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


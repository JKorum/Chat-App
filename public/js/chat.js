const socket = io()

//elements
const $form = document.querySelector(`#form`)
const $submitButton = $form.querySelector(`#send-message`)
const $inputField = $form.querySelector(`#input`)
const $locationButton = document.querySelector(`#send-location`)
const $messages = document.querySelector(`#messages`)
const $sidebar = document.querySelector(`#sidebar`)

//query string options
const nameAndRoom = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.emit(`join`, nameAndRoom, (error) => {	
	if (error) {
		alert(error)
		location.href = `/`
	}
})

const autoscroll = () => {
	//new message element
	const $newMessage = $messages.lastElementChild
  
  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
 
  // Visible height
  const visibleHeight = $messages.offsetHeight
 
  // Height of messages container
  const containerHeight = $messages.scrollHeight
 
  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight
 
 	if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
   }

}

socket.on(`message`, (message) => {
	const { username, text, createdAt } = message
	const speaker = username || `wizard crow`
	const time = moment(createdAt).format(`h:mm a`)

	const html = `
		<div class="message">
			<p>
				<span class="message__name">${speaker}</span>
				<span calss="message__meta">${time}</span>
			</p>
			<p>${text}</p>
		</div>
	`
	$messages.insertAdjacentHTML(`beforeend`, html) 
	autoscroll()
})

socket.on(`locationMessage`, (message) => {
	const { username, url, createdAt } = message

	const time = moment(createdAt).format(`h:mm a`)

	const html = `
		<div class="message">
			<p>
				<span class="message__name">${username}</span>
				<span calss="message__meta">${time}</span>
			</p>
			<p>				
				<a href="${url}" target="_blank">my location</a>
			</p>
		</div>
	`
	$messages.insertAdjacentHTML(`beforeend`, html)
	autoscroll()
})

socket.on(`roomData`, ({ room, users }) => {	
	const html = `
		<h2 class="room-title">Room: ${room}</h2>
		<h3 class="list-title">Users:</h3>
		<ul id="list" class="users"><ul>
	`
	$sidebar.innerHTML = html
	$list = document.querySelector(`#list`)

	users.forEach(user => {
		const html = `<li>${user.username}</li>`
		$list.insertAdjacentHTML(`beforeend`, html)
	})
})

$form.addEventListener(`submit`, (e) => {	
	$submitButton.setAttribute(`disabled`, `disabled`)
	const message = $inputField.value
	
	socket.emit(`sendMessage`, message, () => {
		$submitButton.removeAttribute(`disabled`)
		$inputField.value = ``
		$inputField.focus()		
	})	

	e.preventDefault()
})

$locationButton.addEventListener(`click`, (e) => {
	if (!navigator.geolocation) {
		return alert(`geolocation is not supported by your browser`)
	}

	$locationButton.setAttribute(`disabled`, `disabled`)

	navigator.geolocation.getCurrentPosition((position) => {	
		socket.emit(`sendLocation`, {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			$locationButton.removeAttribute(`disabled`)
			console.log(`location shared`)			
		})

	})
})
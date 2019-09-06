const http = require(`http`) //needed to integrate socket.io
const path = require(`path`)
const express = require(`express`)
const socketio = require(`socket.io`)
const Filter = require(`bad-words`)

const { 
	generateMessage, 
	generateLocationMessage
} = require(`./utils/messages`)

const { 
	addUser, 
	removeUser, 
	getUser, 
	getUsersInRoom 
} = require(`./utils/users`)

const app = express()
const server = http.createServer(app) //needed to integrate socket.io
const io = socketio(server) //add support for WebSocket

const port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, `../public`)))


io.on(`connection`, (socket) => { //socket holds data about connection	
	
	socket.on(`join`, ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room })
		if (error) {
			return callback(error)
		}

		socket.join(user.room)

		socket.emit(`message`, generateMessage(undefined, `welcome to the chat, ${user.username}!`))

		socket.broadcast.to(user.room).emit(`message`, generateMessage(undefined, `${user.username} joined!`))

		io.to(user.room).emit(`roomData`, {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback()
	})

	socket.on(`sendMessage`, (message, callback) => {
		const user = getUser(socket.id) 
		
		const filter = new Filter()

		if(filter.isProfane(message)) {
			socket.emit(`message`, generateMessage(undefined, `profanity is not allowed`))
			callback()	
		} else {
			io.to(user.room).emit(`message`, generateMessage(user.username, message))
			callback()
		}		
	})
	
	socket.on(`sendLocation`, (coords, callback) => {	
		const user = getUser(socket.id)				

		io.to(user.room).emit(`locationMessage`, generateLocationMessage(user.username, coords))
		callback()
	})	

	socket.on(`disconnect`, () => {
		const user = removeUser(socket.id)
		
		if (user) {
			io.to(user.room).emit(`message`, generateMessage(undefined, `${user.username} has left the room`))
			io.to(user.room).emit(`roomData`, {
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}	

	})

})

server.listen(port, () => { //app --> server
	console.log(`server up and running on port ${port}`)
})
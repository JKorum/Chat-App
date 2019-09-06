const users = []

const addUser = ({ id, username, room }) => {
	//sanitize data
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	//validate data
	if (!username || !room) {
		return {
			error: `username and room are required`
		}
	}

	//check for existing user
	const existingUser = users.find(user => {
		return user.username === username && user.room === room
	})

	//validate username
	if (existingUser) {
		return {
			error: `username is in use`
		}
	}

	//create and store new user
	const user = { id, username, room }
	users.push(user)
	
	return {
		user
	}
}

//in --> id / out --> user deleted
const removeUser = (id) => {
	const index = users.findIndex(user => user.id === id)

	if (index !== -1) {
		return users.splice(index, 1)[0]
	}
}

//in --> id / out --> user or undefined 
const getUser = (id) => {
	return users.find(user => user.id === id)
}

//in --> room / out --> array of users or []
const getUsersInRoom = (room) => {
	return users.filter(user => user.room === room)
}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
}
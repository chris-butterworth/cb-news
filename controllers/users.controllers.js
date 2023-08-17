const { getAllUsers, getUserById } = require('../models/users.models')

exports.getUsers = (request, response, next) => {
	getAllUsers()
		.then((users) => {
			response.status(200).send(users)
		})
		.catch(next)
}
exports.getUser = (request, response, next) => {
	const { username } = request.params
	getUserById(username)
		.then(([user]) => {
			response.status(200).send(user)
		})
		.catch(next)
}

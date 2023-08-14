const fs = require('fs/promises')

exports.getEndpoints = (request, response, next) => {
	return fs.readFile('./endpoints.json', 'utf8').then((data) => {
		const endpoints = JSON.parse(data)
		response.status(200).send(endpoints)
	})
}

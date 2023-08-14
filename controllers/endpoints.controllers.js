const { getEndpointsData } = require('../models/endpoints.models')

exports.getEndpoints = (request, response, next) => {
	getEndpointsData().then((endpoints) => {
		response.status(200).send(endpoints)
	})
}

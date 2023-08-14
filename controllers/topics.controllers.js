const { getTopicsData } = require('../models/topics.models')

exports.getTopics = (request, response, next) => {
	getTopicsData().then((topics) => {
		response.status(200).send(topics)
	})
}

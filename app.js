const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')

const app = express()

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.use((error, request, response, next) => {
	if (err) response.status(500).send('500 internal server error')
})
module.exports = app

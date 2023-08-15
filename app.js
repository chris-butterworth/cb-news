const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const { getComments } = require('./controllers/comments.controllers')
const {
	getArticle,
	getArticles,
} = require('./controllers/articles.controllers')
const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require('./errors/errors')

const app = express()

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticle)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getComments)

app.use((req, res) => {
	res.status(404).send({ msg: 'Not found' })
})

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app

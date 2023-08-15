const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const {
	getArticle,
	getArticles,
} = require('./controllers/articles.controllers')
const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require('./errors/errors')
const { postComment } = require('./controllers/comments.controllers')

const app = express()

app.use(express.json())

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticle)

app.get('/api/articles', getArticles)

app.post('/api/articles/:article_id/comments', postComment)

app.use((req, res) => {
	res.status(404).send({ msg: 'Not found' })
})

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app

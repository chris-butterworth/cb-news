const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const {
	getComments,
	removeComment,
} = require('./controllers/comments.controllers')
const {
	getArticle,
	getArticles,
	addVotes,
} = require('./controllers/articles.controllers')
const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require('./errors/errors')
const { postComment } = require('./controllers/comments.controllers')
const { getUsers } = require('./controllers/users.controllers')

const app = express()
app.use(express.json())

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticle)
app.patch('/api/articles/:article_id', addVotes)

app.get('/api/articles/:article_id/comments', getComments)
app.post('/api/articles/:article_id/comments', postComment)

app.get('/api/users', getUsers)


app.delete('/api/comments/:comment_id', removeComment)

app.use((req, res) => {
	res.status(404).send({ msg: 'Path not found' })
})
app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)

module.exports = app

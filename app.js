const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getArticle } = require('./controllers/articles.controllers')
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require('./errors/errors')

const app = express()

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticle)

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)
module.exports = app

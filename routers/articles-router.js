const articlesRouter = require('express').Router()
const commentsRouter = require('./comments-router')

const {
	getArticle,
	getArticles,
	addVotes,
} = require('../controllers/articles.controllers')

articlesRouter.get('/', getArticles)
articlesRouter.get('/:article_id', getArticle)
articlesRouter.patch('/:article_id', addVotes)

articlesRouter.use('/:article_id/comments', (request, _, next) => {
	request.article_id = request.params.article_id
	next()
})
articlesRouter.use('/:article_id/comments', commentsRouter)

module.exports = articlesRouter

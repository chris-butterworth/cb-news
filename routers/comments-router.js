const commentsRouter = require('express').Router()

const {
	getComments,
	postComment,
	removeComment,
} = require('../controllers/comments.controllers')

commentsRouter.get('/', getComments)
commentsRouter.post('/', postComment)
commentsRouter.delete('/:comment_id', removeComment)

module.exports = commentsRouter

const commentsRouter = require('express').Router()

const {
	getComments,
	postComment,
	addVotes,
	removeComment,
} = require('../controllers/comments.controllers')

commentsRouter.get('/', getComments)
commentsRouter.post('/', postComment)
commentsRouter.patch('/:comment_id', addVotes)
commentsRouter.delete('/:comment_id', removeComment)

module.exports = commentsRouter

const {
	getCommentsByArticleId,
	postNewComment,
	removeCommentById,
} = require('../models/comments.models')
const { getArticleById } = require('../models/articles.models')
const { getUser } = require('../models/users.models')

exports.getComments = (request, response, next) => {
	const {article_id} = request
	const promises = [
		getCommentsByArticleId(article_id),
		getArticleById(article_id),
	]

	return Promise.all(promises)
		.then((resolvedPromises) => {
			const comments = resolvedPromises[0]
			response.status(200).send(comments)
		})
		.catch(next)
}

exports.postComment = (request, response, next) => {
	const {article_id} = request
	const { body } = request.body
	const { username } = request.body

	if (!body || !username) {
		const error = { status: 400, msg: 'Bad request, please see ./endpoints' }
		return next(error)
	}
	getUser(username)
		.then(() => {
			return getArticleById(article_id)
		})
		.then(() => {
			return postNewComment(body, username, article_id)
		})
		.then(([postedComment]) => {
			response.status(201).send(postedComment)
		})
		.catch(next)
}

exports.removeComment = (request, response, next) => {
	const { comment_id } = request.params

	removeCommentById(comment_id)
		.then(() => {
			response.status(204).send()
		})
		.catch(next)
}

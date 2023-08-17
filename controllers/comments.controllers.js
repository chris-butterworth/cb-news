const {
	getCommentsByArticleId,
	getCommentById,
	postNewComment,
	addCommentVotes,
	removeCommentById,
} = require('../models/comments.models')
const { getArticleById } = require('../models/articles.models')
const { getUserById } = require('../models/users.models')

exports.getComments = (request, response, next) => {
	const { article_id } = request
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
	const { article_id } = request
	const { body } = request.body
	const { username } = request.body

	if (!body || !username) {
		const error = { status: 400, msg: 'Bad request, please see ./endpoints' }
		return next(error)
	}
	getUserById(username)
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

exports.addVotes = (request, response, next) => {
	const { comment_id } = request.params
	const { inc_votes } = request.body

	if (!inc_votes) {
		const error = { status: 400, msg: 'Bad request, please see ./endpoints' }
		return next(error)
	}
	const promises = [
		addCommentVotes(inc_votes, comment_id),
		getCommentById(comment_id),
	]

	return Promise.all(promises)
		.then((resolvedPromises) => {
			const [updatedComment] = resolvedPromises[0]
			response.status(200).send(updatedComment)
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

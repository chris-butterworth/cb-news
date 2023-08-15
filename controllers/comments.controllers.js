const { postNewComment } = require('../models/comments.models')
const { getArticleById } = require('../models/articles.models')
const { getUser } = require('../models/users.models')

exports.postComment = (request, response, next) => {
	const { article_id } = request.params
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

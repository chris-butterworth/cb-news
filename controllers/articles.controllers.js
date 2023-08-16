const {
	getArticleById,
	getAllArticles,
	updateArticleVotes,
} = require('../models/articles.models')

exports.getArticle = (request, response, next) => {
	const { article_id } = request.params
	getArticleById(article_id)
		.then(([article]) => {
			response.status(200).send(article)
		})
		.catch(next)
}

exports.getArticles = (request, response, next) => {
	getAllArticles().then((articles) => {
		response.status(200).send(articles)
	})
}

exports.addVotes = (request, response, next) => {
	const { article_id } = request.params
	const { inc_votes } = request.body

	if (!inc_votes) {
		const error = { status: 400, msg: 'Bad request, please see ./endpoints' }
		return next(error)
	}

	const promises = [
		updateArticleVotes(inc_votes, article_id),
		getArticleById(article_id),
	]

	return Promise.all(promises)
		.then((resolvedPromises) => {
			const [updatedArticle] = resolvedPromises[0]
			response.status(200).send(updatedArticle)
		})
		.catch(next)
}

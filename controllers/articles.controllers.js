const {
	getArticleById,
	getAllArticles,
	updateArticleVotes,
	postNewArticle,
} = require('../models/articles.models')
const { getTopic } = require('../models/topics.models')

exports.getArticle = (request, response, next) => {
	const { article_id } = request.params
	getArticleById(article_id)
		.then(([article]) => {
			response.status(200).send(article)
		})
		.catch(next)
}

exports.getArticles = (request, response, next) => {
	const { topic } = request.query
	const { sort_by } = request.query
	const { order } = request.query

	const promises = [getAllArticles(topic, sort_by, order)]
	if (topic) promises.push(getTopic(topic))

	return Promise.all(promises)
		.then((promises) => {
			response.status(200).send(promises[0])
		})
		.catch(next)
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

exports.postArticle = (request, response, next) => {
	const { author } = request.body
	const { title } = request.body
	const { body } = request.body
	const { topic } = request.body
	const { article_img_url } = request.body

	if (!author || !title || !body || !topic) {
		const error = { status: 400, msg: 'Bad request, please see ./endpoints' }
		return next(error)
	}
	postNewArticle(author, title, body, topic, article_img_url).then(
		([newArticle]) => {
			newArticle.comment_count = 0
			response.status(201).send(newArticle)
		}
	)
}

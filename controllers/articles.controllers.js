const { getArticleById, getAllArticles } = require('../models/articles.models')

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
		articles.forEach((article) => {
			article.comment_count = +article.comment_count
		})
		response.status(200).send(articles)
	})
}

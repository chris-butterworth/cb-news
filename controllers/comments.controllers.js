const { getCommentsByArticleId } = require('../models/comments.models')
const { getArticleById } = require('../models/articles.models')

exports.getComments = (request, response, next) => {
    const { article_id } = request.params
    
	const promises = [getCommentsByArticleId(article_id), getArticleById(article_id)]
    
	Promise.all(promises)
		.then((resolvedPromises) => {
			const comments = resolvedPromises[0]
			response.status(200).send(comments)
		})
		.catch(next)
}

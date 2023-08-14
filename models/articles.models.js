const db = require('../db/connection')

exports.getArticleById = (article_id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
		.then((article) => {
			if (!article.rowCount) {
				return Promise.reject({
					status: 404,
					msg: `No article found for article_id ${article_id}`,
				})
			} else {
				return article.rows
			}
		})
}

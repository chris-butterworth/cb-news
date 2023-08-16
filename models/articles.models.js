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

exports.getAllArticles = () => {
	return db
		.query(
			`
	SELECT 
	articles.author,
	articles.title,
	articles.article_id,
	articles.topic,
	articles.created_at,
	articles.votes,
	articles.article_img_url,
	CAST(COUNT(comments.article_id) AS INT) AS comment_count 
	FROM articles 
	LEFT JOIN comments ON articles.article_id = comments.article_id
	GROUP BY articles.article_id
	ORDER BY articles.created_at DESC
	`
		)
		.then((articles) => {
			return articles.rows
		})
}

exports.updateArticleVotes = (newVotes, article_id) => {
	return db
		.query(
			`
	UPDATE articles
	SET votes = votes + $1
	WHERE article_id = $2
	RETURNING *
	`,
			[newVotes, article_id]
		)
		.then((article) => {

			return article.rows
		})
}

const db = require('../db/connection')

exports.getArticleById = (article_id) => {
	return db
		.query(
			`
		SELECT articles.*, 
		CAST(COUNT(comments.article_id) AS INT) AS comment_count
		FROM articles
		LEFT JOIN comments
		ON articles.article_id = comments.article_id
		WHERE articles.article_id = $1
		GROUP BY articles.article_id
		`,
			[article_id]
		)
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

exports.getAllArticles = (topic, sort_by = 'created_at', order = 'DESC') => {
	const acceptedSort = [
		'author',
		'title',
		'article_id',
		'topic',
		'created_at',
		'votes',
		'comment_count',
	]
	const acceptedOrder = ['ASC', 'DESC']

	const queryValues = []
	let whereModifier = ''
	if (topic) {
		whereModifier += `WHERE topic = $1`
		queryValues.push(topic)
	}

	if (!acceptedSort.includes(sort_by)) {
		return Promise.reject({ status: 400, msg: { acceptedSort: acceptedSort } })
	}

	if (!acceptedOrder.includes(order.toUpperCase())) {
		return Promise.reject({
			status: 400,
			msg: { acceptedOrder: acceptedOrder },
		})
	}

	const dbQuery = `
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
	${whereModifier} 
	GROUP BY articles.article_id
	ORDER BY ${sort_by} ${order}`

	return db.query(dbQuery, queryValues).then(({ rows }) => {
		return rows
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
		.then(({ rows }) => {
			return rows
		})
}

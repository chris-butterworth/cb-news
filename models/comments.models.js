const db = require('../db/connection')

exports.getCommentsByArticleId = (article_id) => {
	return db
		.query(
			`
        SELECT * FROM comments 
        WHERE article_id = $1 
        ORDER BY created_at DESC
        `,
			[article_id]
		)
		.then(({ rows }) => {
			return rows
		})
}

exports.postNewComment = (body, author, article_id) => {
	return db
		.query(
			`
        INSERT INTO comments (body, author, article_id, votes)
        VALUES ($1, $2, $3, $4) RETURNING *
    `,
			[body, author, article_id, 0]
		)
		.then(({rows}) => {
			return rows
		})
}
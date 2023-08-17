const db = require('../db/connection')

exports.getTopicsData = () => {
	return db.query(`SELECT * FROM topics`).then(({rows}) => {
		return rows
	})
}

exports.getTopic = (topic) => {
	return db
		.query(
			`
        SELECT * FROM topics
        WHERE slug = $1
        `,
			[topic]
		)
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ status: 404, msg: `Topic ${topic} not found` })
			}
			return rows
		})
}

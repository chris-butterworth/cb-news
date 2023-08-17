const db = require('../db/connection')

exports.getUser = (username) => {
	return db
		.query(
			`
    SELECT * FROM users
    WHERE username = $1
`,
			[username]
		)
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ status: 404, msg: `User ${username} not found` })
			}
			return rows
		})
}

exports.getAllUsers = () => {
	return db
		.query(
			`
	SELECT * FROM users
	`
		)
		.then(({rows}) => {
			return rows
		})
}
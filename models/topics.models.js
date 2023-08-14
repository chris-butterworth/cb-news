const db = require('../db/connection')

exports.getTopicsData = () => {
    return db.query(`SELECT * FROM topics`).then((topics) => {
        return topics.rows
	})
}

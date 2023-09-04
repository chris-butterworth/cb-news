const express = require('express')
const apiRouter = require('./routers/api-router')
const app = express()
const cors = require('cors');

app.use(cors());

app.use(express.json())
const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require('./errors/errors')

app.use('/api', apiRouter)

app.use((req, res) => {
	res.status(404).send({ msg: 'Path not found' })
})
app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)

module.exports = app

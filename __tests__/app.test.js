const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const fs = require('fs/promises')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe('GET /api/notapath', () => {
	test('ALL:404 responds with 404 Not found for any invalid path', () => {
		return request(app)
			.get('/api/notapath')
			.expect(404)
			.then(({ body }) => {
				const { msg } = body
				expect(msg).toBe('Path not found')
			})
	})
})

describe('GET /api/topics', () => {
	test('GET:200 responds with an array of topic objects.', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then((response) => {
				const topics = response.body
				expect(topics).toHaveLength(3)
				topics.forEach((topic) => {
					expect(topic).toHaveProperty('slug', expect.any(String))
					expect(topic).toHaveProperty('description', expect.any(String))
				})
			})
	})
})

describe('GET /api', () => {
	test('GET:200 responds with an object describing all the available endpoints on your API', () => {
		fs.readFile('./endpoints.json', 'utf8')
			.then((data) => {
				const endpoints = JSON.parse(data)
				return endpoints
			})
			.then((endpoints) => {
				return request(app)
					.get('/api')
					.expect(200)
					.then((response) => {
						const parsedResponse = JSON.parse(response.text)

						expect(parsedResponse).toEqual(endpoints)
					})
			})
	})
})

describe('GET /api/articles/:article_id', () => {
	test('GET:200 responds with an article object', () => {
		return request(app)
			.get('/api/articles/1')
			.expect(200)
			.then((response) => {
				expect(response.body).toHaveProperty('author', expect.any(String))
				expect(response.body).toHaveProperty('title', expect.any(String))
				expect(response.body).toHaveProperty('article_id', expect.any(Number))
				expect(response.body).toHaveProperty('body', expect.any(String))
				expect(response.body).toHaveProperty('topic', expect.any(String))
				expect(response.body).toHaveProperty('created_at', expect.any(String))
				expect(response.body).toHaveProperty('votes', expect.any(Number))
				expect(response.body).toHaveProperty(
					'article_img_url',
					expect.any(String)
				)
			})
	})
	test('GET:404 responds with Not Found when request is valid but the id is not found in the database', () => {
		return request(app)
			.get('/api/articles/999')
			.expect(404)
			.then((response) => {
				expect(response.body).toEqual({
					msg: 'No article found for article_id 999',
				})
			})
	})
	test('GET:400 responds with Bad Request when given an invalid input', () => {
		return request(app)
			.get('/api/articles/bananas')
			.expect(400)
			.then((response) => {
				expect(response.body).toEqual({ msg: 'Bad request' })
			})
	})
})
describe('GET /api/articles', () => {
	test('GET:200 responds with an array of all article objects sorted by date descending', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then((response) => {
				expect(response.body).toHaveLength(13)
				expect(response.body).toBeSortedBy('created_at', { descending: true })
				response.body.forEach((article) => {
					expect(article).not.toHaveProperty('body', expect.any(String))
					expect(article).toHaveProperty('author', expect.any(String))
					expect(article).toHaveProperty('title', expect.any(String))
					expect(article).toHaveProperty('article_id', expect.any(Number))
					expect(article).toHaveProperty('topic', expect.any(String))
					expect(article).toHaveProperty('created_at', expect.any(String))
					expect(article).toHaveProperty('votes', expect.any(Number))
					expect(article).toHaveProperty('article_img_url', expect.any(String))
					expect(article).toHaveProperty('comment_count', expect.any(Number))
				})
			})
	})
})
describe('GET /api/articles/:article_id/comments', () => {
	test('GET:200 responds with all the comments containing the passed article_id', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body }) => {
				expect(body).toHaveLength(11)
				expect(body).toBeSortedBy('created_at', { descending: true })
				body.forEach((article) => {
					expect(article).toHaveProperty('comment_id', expect.any(Number))
					expect(article).toHaveProperty('votes', expect.any(Number))
					expect(article).toHaveProperty('created_at', expect.any(String))
					expect(article).toHaveProperty('author', expect.any(String))
					expect(article).toHaveProperty('body', expect.any(String))
					expect(article.article_id).toBe(1)
				})
			})
	})
	test('GET:200 responds with an empty array if passed a valid article_id containing no comments', () => {
		return request(app)
			.get('/api/articles/2/comments')
			.expect(200)
			.then(({ body }) => {
				expect(body).toHaveLength(0)
			})
	})
	test('GET:404 responds with Not Found when request is valid but the id is not found in the database', () => {
		return request(app)
			.get('/api/articles/999/comments')
			.expect(404)
			.then((response) => {
				expect(response.body).toEqual({
					msg: 'No article found for article_id 999',
				})
			})
	})
	test('GET:400 responds with Bad Request when given an invalid input', () => {
		return request(app)
			.get('/api/articles/bananas/comments')
			.expect(400)
			.then((response) => {
				expect(response.body).toEqual({ msg: 'Bad request' })
			})
	})
})

describe('POST /api/articles/:article_id/comments', () => {
	test('POST:201 adds a comment for an article', () => {
		return request(app)
			.post('/api/articles/2/comments')
			.send({
				username: 'rogersop',
				body: 'Such coding many comments wow',
			})
			.expect(201)
			.then(({ _body }) => {
				expect(_body.comment_id).toBe(19)
				expect(_body.body).toBe('Such coding many comments wow')
				expect(_body.article_id).toBe(2)
				expect(_body.author).toBe('rogersop')
				expect(_body.votes).toBe(0)
				expect(_body).toHaveProperty('created_at', expect.any(String))
			})
	})
	test('POST:201 will ignore any additional properties passed in with the body object', () => {
		return request(app)
			.post('/api/articles/2/comments')
			.send({
				username: 'rogersop',
				body: 'Such coding many comments wow',
				key: 'value',
			})
			.expect(201)
			.then(({ _body }) => {
				expect(_body).not.toHaveProperty('key')
				expect(_body.comment_id).toBe(19)
				expect(_body.body).toBe('Such coding many comments wow')
				expect(_body.article_id).toBe(2)
				expect(_body.author).toBe('rogersop')
				expect(_body.votes).toBe(0)
				expect(_body).toHaveProperty('created_at', expect.any(String))
			})
	})
	test('POST:404 responds with 404 when request is valid but the article_id is not found', () => {
		return request(app)
			.post('/api/articles/999/comments')
			.send({
				username: 'rogersop',
				body: 'Such coding many comments wow',
			})
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('No article found for article_id 999')
			})
	})
	test('POST:404 responds with 404 when request is valid but the username is not found', () => {
		return request(app)
			.post('/api/articles/2/comments')
			.send({
				username: 'doge',
				body: 'Such coding many comments wow',
			})
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('User not found')
			})
	})
	test('POST:400 responds with 400 when the article_id is invalid', () => {
		return request(app)
			.post('/api/articles/banana/comments')
			.send({
				username: 'rogersop',
				body: 'Such coding many comments wow',
			})
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request')
			})
	})
	test('POST:400 responds with 400 when the post body is the wrong format', () => {
		return request(app)
			.post('/api/articles/2/comments')
			.send('Such coding many comments wow')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request, please see ./endpoints')
			})
	})
})
describe('DELETE /api/comments/:comment_id', () => {
	test('DELETE:204 responds with 204 no content, removes the passed comment from the database', () => {
		return request(app)
			.delete('/api/comments/1')
			.expect(204)
			.then(() => {
				return db.query(`SELECT * FROM comments`).then(({ rows }) => {
					const verified = rows.some((comment) => {
						comment.comment_id === 1
					})
					expect(verified).toBe(false)
				})
			})
	})
	test('DELETE:404 responds with 404 when the request is valid but the comment is not found', () => {
		return request(app)
			.delete('/api/comments/999')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('No comment found at comment_id 999')
			})
	})
	test('DELETE:400 responds with 400 when passed an invalid comment_id', () => {
		return request(app)
			.delete('/api/comments/morebananas')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request')
			})
	})
})

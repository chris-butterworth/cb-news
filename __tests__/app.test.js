const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const fs = require('fs/promises')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe('/api/notapath', () => {
	test('ALL:404 responds with 404 Not found for any invalid path', () => {
		return request(app)
			.get('/api/notapath')
			.expect(404)
			.then(({ body }) => {
				const { msg } = body
				expect(msg).toBe('Not found')
			})
	})
})

describe('/api/topics', () => {
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

describe('/api', () => {
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

describe('/api/articles/:article_id', () => {
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
describe('/api/articles', () => {
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

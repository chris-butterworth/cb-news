const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')

beforeEach(() => seed(testData))
afterAll(() => db.end())

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
				expect(response.body).toEqual({ msg: 'No article found for article_id 999' })
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

const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const fs = require('fs/promises')

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

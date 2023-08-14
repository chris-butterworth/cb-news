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

describe('/api', () => {
	test('GET:200 esponds with an object describing all the available endpoints on your API', () => {
		return request(app)
			.get('/api')
			.expect(200)
			.then((response) => {
				const endpoints = response.text
				expect(typeof endpoints).toBe('string')

				const parsedEndpoints = JSON.parse(endpoints)
				expect(typeof parsedEndpoints).toBe('object')

				for (let endpoint in parsedEndpoints) {
					expect(parsedEndpoints[endpoint]).toHaveProperty(
						'description',
						expect.any(String)
					)

					if (endpoint.startsWith('GET /api/')) {
						expect(parsedEndpoints[endpoint]).toHaveProperty(
							'queries',
							expect.any(Object)
						)
						expect(parsedEndpoints[endpoint]).toHaveProperty(
							'exampleResponse',
							expect.any(Object)
						)
					}

					if (endpoint.startsWith('POST' || 'PATCH')) {
						expect(parsedEndpoints[endpoint]).toHaveProperty(
							'requestBodyFormat',
							expect.any(Object)
						)

						expect(parsedEndpoints[endpoint]).toHaveProperty(
							'exampleResponse',
							expect.any(Object)
						)
					}
				}
			})
	})
})

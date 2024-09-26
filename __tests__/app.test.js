const app = require('../app')
const fs = require('fs/promises')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe('/api/notapath', () => {
	describe('GET', () => {
		test('ALL:404 responds with Not found for any invalid path', () => {
			return request(app)
				.get('/api/notapath')
				.expect(404)
				.then(({ body }) => {
					const { msg } = body
					expect(msg).toBe('Path not found')
				})
		})
	})
})
describe('/api', () => {
	describe('GET', () => {
		test('GET:200 responds with an object describing all the available endpoints on the API', () => {
			fs.readFile('./endpoints.json', 'utf8')
				.then((data) => {
					const endpoints = JSON.parse(data)
					return endpoints
				})
				.then((endpoints) => {
					return request(app)
						.get('/api')
						.expect(200)
						.then(({ text }) => {
							const parsedResponse = JSON.parse(text)
							expect(parsedResponse).toEqual(endpoints)
						})
				})
		})
	})
})
describe('/api/topics', () => {
	describe('GET', () => {
		test('GET:200 responds with an array of topic objects.', () => {
			return request(app)
				.get('/api/topics')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(3)
					body.forEach((topic) => {
						expect(topic).toHaveProperty('slug', expect.any(String))
						expect(topic).toHaveProperty('description', expect.any(String))
					})
				})
		})
	})
})
describe('/api/articles', () => {
	describe('GET', () => {
		test('GET:200 responds with an array of all article objects sorted by date descending', () => {
			return request(app)
				.get('/api/articles')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(10)
					expect(body).toBeSortedBy('created_at', { descending: true })
					body.forEach((article) => {
						// expect(article).not.toHaveProperty('body', expect.any(String))
						expect(article).toHaveProperty('author', expect.any(String))
						expect(article).toHaveProperty('title', expect.any(String))
						expect(article).toHaveProperty('article_id', expect.any(Number))
						expect(article).toHaveProperty('topic', expect.any(String))
						expect(article).toHaveProperty('created_at', expect.any(String))
						expect(article).toHaveProperty('votes', expect.any(Number))
						expect(article).toHaveProperty(
							'article_img_url',
							expect.any(String)
						)
						expect(article).toHaveProperty('comment_count', expect.any(Number))
					})
				})
		})
		test('GET:200 a valid query topic will filter results by the passed topic', () => {
			return request(app)
				.get('/api/articles?topic=cats')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(1)
				})
		})
		test('GET:200 a valid query topic with no results will respond with an empty array of articles', () => {
			return request(app)
				.get('/api/articles?topic=paper')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(0)
				})
		})
		test('GET:200 query sort_by will sort articles by any valid column', () => {
			return request(app)
				.get('/api/articles?sort_by=votes')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(10)
					expect(body).toBeSortedBy('votes', { descending: true })
				})
		})
		test('GET:200 query order can be set to asc or desc', () => {
			return request(app)
				.get('/api/articles?sort_by=votes&order=asc')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(10)
					expect(body).toBeSortedBy('votes')
				})
		})
		test('GET:200 query limit will limit the number of results returned', () => {
			return request(app)
				.get('/api/articles?limit=3')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(3)
				})
		})
		test('GET:200 an invalid query limit will be ignored and return the default number of results', () => {
			return request(app)
				.get('/api/articles?limit=bananas')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(10)
				})
		})
		test('GET:200 query page will offset the results returned by the limit', () => {
			return request(app)
				.get('/api/articles?page=2&limit=2&sort_by=article_id&order=asc')
				.expect(200)
				.then(({body}) => {
					expect(body[0].article_id).toBe(3)
					expect(body[1].article_id).toBe(4)

				})
		})
		test('GET:200 an invalid page limit will be ignored and return the default number of results', () => {
			return request(app)
				.get('/api/articles?page=bananas&limit=2&sort_by=article_id&order=asc')
				.expect(200)
				.then(({ body }) => {
					expect(body[0].article_id).toBe(1)
					expect(body[1].article_id).toBe(2)

				})
		})
		test('GET:400 an invalid sort_by will return a 400 error', () => {
			return request(app)
				.get('/api/articles?sort_by=bananas')
				.expect(400)
				.then(({ body }) => {
					expect(body).toEqual({
						msg: {
							acceptedSort: [
								'author',
								'title',
								'article_id',
								'topic',
								'created_at',
								'votes',
								'comment_count',
							],
						},
					})
				})
		})
		test('GET:400 an invalid order will return a 400 error', () => {
			return request(app)
				.get('/api/articles?order=bananas')
				.expect(400)
				.then(({ body }) => {
					expect(body).toEqual({
						msg: {
							acceptedOrder: ['ASC', 'DESC'],
						},
					})
				})
		})
		test('GET:404 an invalid query topic will return 404 topic not found', () => {
			return request(app)
				.get('/api/articles?topic=bananas')
				.expect(404)
				.then(({ body }) => {
					expect(body).toEqual({
						msg: 'Topic bananas not found',
					})
				})
		})
	})
	describe('POST', () => {
		test('POST:201 adds a new article', () => {
			return request(app)
				.post('/api/articles')
				.send({
					author: 'rogersop',
					title: 'article title',
					body: 'article text',
					topic: 'mitch',
					article_img_url: 'url',
				})
				.expect(201)
				.then(({ _body }) => {
					expect(_body.article_id).toBe(14)
					expect(_body.author).toBe('rogersop')
					expect(_body.title).toBe('article title')
					expect(_body.body).toBe('article text')
					expect(_body.article_img_url).toBe('url')
					expect(_body.votes).toBe(0)
					expect(_body.comment_count).toBe(0)
					expect(_body).toHaveProperty('created_at', expect.any(String))
				})
		})
		test('POST:201 adds a new article, image url defaults if not provided', () => {
			return request(app)
				.post('/api/articles')
				.send({
					author: 'rogersop',
					title: 'article title',
					body: 'article text',
					topic: 'mitch',
				})
				.expect(201)
				.then(({ _body }) => {
					expect(_body.article_id).toBe(14)
					expect(_body.author).toBe('rogersop')
					expect(_body.title).toBe('article title')
					expect(_body.body).toBe('article text')
					expect(_body.article_img_url).toBe(
						'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
					)
					expect(_body.votes).toBe(0)
					expect(_body.comment_count).toBe(0)
					expect(_body).toHaveProperty('created_at', expect.any(String))
				})
		})
		test('POST:201 will ignore any additional properties passed in with the body object', () => {
			return request(app)
				.post('/api/articles')
				.send({
					author: 'rogersop',
					title: 'article title',
					body: 'article text',
					topic: 'mitch',
					key: 'value',
				})
				.expect(201)
				.then(({ _body }) => {
					expect(_body.article_id).toBe(14)
					expect(_body.author).toBe('rogersop')
					expect(_body.title).toBe('article title')
					expect(_body.body).toBe('article text')
					expect(_body.article_img_url).toBe(
						'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
					)
					expect(_body.votes).toBe(0)
					expect(_body.comment_count).toBe(0)
					expect(_body).toHaveProperty('created_at', expect.any(String))
				})
		})
		test('POST:400 responds with 400 when the post body is the wrong format', () => {
			return request(app)
				.post('/api/articles')
				.send('article text')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request, please see ./endpoints')
				})
		})
		test('POST:400 responds with 400 if any of the required object keys are missing', () => {
			return request(app)
				.post('/api/articles')
				.send({
					title: 'article title',
					body: 'article text',
					topic: 'mitch',
					key: 'value',
				})
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request, please see ./endpoints')
				})
		})
	})
	describe('/api/articles/:article_id', () => {
		describe('GET', () => {
			test('GET:200 responds with an article object', () => {
				return request(app)
					.get('/api/articles/1')
					.expect(200)
					.then(({ body }) => {
						expect(body.comment_count).toBe(11)
						expect(body).toHaveProperty('author', expect.any(String))
						expect(body).toHaveProperty('title', expect.any(String))
						expect(body).toHaveProperty('article_id', expect.any(Number))
						expect(body).toHaveProperty('body', expect.any(String))
						expect(body).toHaveProperty('topic', expect.any(String))
						expect(body).toHaveProperty('created_at', expect.any(String))
						expect(body).toHaveProperty('votes', expect.any(Number))
						expect(body).toHaveProperty('article_img_url', expect.any(String))
					})
			})
			test('GET:404 responds with Not Found when request is valid but the id is not found in the database', () => {
				return request(app)
					.get('/api/articles/999')
					.expect(404)
					.then(({ body }) => {
						expect(body).toEqual({
							msg: 'No article found for article_id 999',
						})
					})
			})
			test('GET:400 responds with Bad Request when given an invalid input', () => {
				return request(app)
					.get('/api/articles/bananas')
					.expect(400)
					.then(({ body }) => {
						expect(body).toEqual({ msg: 'Bad request' })
					})
			})
		})

		describe('PATCH', () => {
			test('PATCH:200 increases the vote value of an article by 1 and returns the updated article', () => {
				return request(app)
					.patch('/api/articles/1')
					.send({ inc_votes: 1 })
					.expect(200)
					.then(({ body }) => {
						expect(body.votes).toBe(101)
						expect(body).toHaveProperty('author', expect.any(String))
						expect(body).toHaveProperty('title', expect.any(String))
						expect(body).toHaveProperty('article_id', expect.any(Number))
						expect(body).toHaveProperty('body', expect.any(String))
						expect(body).toHaveProperty('topic', expect.any(String))
						expect(body).toHaveProperty('created_at', expect.any(String))
						expect(body).toHaveProperty('article_img_url', expect.any(String))
					})
			})
			test('PATCH:200 decreases the vote value of an article by 100 and returns the updated article', () => {
				return request(app)
					.patch('/api/articles/1')
					.send({ inc_votes: -100 })
					.expect(200)
					.then(({ body }) => {
						expect(body.votes).toBe(0)
						expect(body).toHaveProperty('author', expect.any(String))
						expect(body).toHaveProperty('title', expect.any(String))
						expect(body).toHaveProperty('article_id', expect.any(Number))
						expect(body).toHaveProperty('body', expect.any(String))
						expect(body).toHaveProperty('topic', expect.any(String))
						expect(body).toHaveProperty('created_at', expect.any(String))
						expect(body).toHaveProperty('article_img_url', expect.any(String))
					})
			})
			test('PATCH:404 responds with Not found if that article_id is valid but doesnt exist', () => {
				return request(app)
					.patch('/api/articles/911')
					.send({ inc_votes: 1 })
					.expect(404)
					.then(({ body }) => {
						expect(body.msg).toBe('No article found for article_id 911')
					})
			})
			test('PATCH:400 responds with Bad request if given an invalid article id', () => {
				return request(app)
					.patch('/api/articles/banana')
					.send({ inc_votes: 1 })
					.expect(400)
					.then(({ body }) => {
						expect(body.msg).toBe('Bad request')
					})
			})
			test('PATCH:400 responds with Bad request if given an invalid body', () => {
				return request(app)
					.patch('/api/articles/1')
					.send({ dave: 1 })
					.expect(400)
					.then(({ body }) => {
						expect(body.msg).toBe('Bad request, please see ./endpoints')
					})
			})
		})
	})

	describe('/api/articles/:article_id/comments', () => {
		describe('GET', () => {
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
					.then(({ body }) => {
						expect(body).toEqual({
							msg: 'No article found for article_id 999',
						})
					})
			})
			test('GET:400 responds with Bad Request when given an invalid input', () => {
				return request(app)
					.get('/api/articles/bananas/comments')
					.expect(400)
					.then(({ body }) => {
						expect(body).toEqual({ msg: 'Bad request' })
					})
			})
		})

		describe('POST', () => {
			test('POST:201 adds a comment for an article', () => {
				return request(app)
					.post('/api/articles/2/comments')
					.send({
						username: 'rogersop',
						body: 'comment text',
					})
					.expect(201)
					.then(({ _body }) => {
						expect(_body.comment_id).toBe(19)
						expect(_body.body).toBe('comment text')
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
						body: 'comment text',
						key: 'value',
					})
					.expect(201)
					.then(({ _body }) => {
						expect(_body).not.toHaveProperty('key')
						expect(_body.comment_id).toBe(19)
						expect(_body.body).toBe('comment text')
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
						body: 'comment text',
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
						username: 'username',
						body: 'comment text',
					})
					.expect(404)
					.then(({ body }) => {
						expect(body.msg).toBe('User username not found')
					})
			})
			test('POST:400 responds with 400 when the article_id is invalid', () => {
				return request(app)
					.post('/api/articles/bananas/comments')
					.send({
						username: 'rogersop',
						body: 'comment text',
					})
					.expect(400)
					.then(({ body }) => {
						expect(body.msg).toBe('Bad request')
					})
			})
			test('POST:400 responds with 400 when the post body is the wrong format', () => {
				return request(app)
					.post('/api/articles/2/comments')
					.send('comment text')
					.expect(400)
					.then(({ body }) => {
						expect(body.msg).toBe('Bad request, please see ./endpoints')
					})
			})
		})
	})
})
describe('/api/users', () => {
	describe('GET', () => {
		test('GET:200 responds with an array of user objects.', () => {
			return request(app)
				.get('/api/users')
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveLength(4)
					body.forEach((user) => {
						expect(user).toHaveProperty('username', expect.any(String))
						expect(user).toHaveProperty('name', expect.any(String))
						expect(user).toHaveProperty('avatar_url', expect.any(String))
					})
				})
		})
	})
	describe('/api/users/:username', () => {
		describe('GET', () => {
			test('GET:200 responds a single user object', () => {
				return request(app)
					.get('/api/users/rogersop')
					.expect(200)
					.then(({ body }) => {
						expect(body.username).toBe('rogersop')
						expect(body.name).toBe('paul')
						expect(body.avatar_url).toBe(
							'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
						)
					})
			})
			test('GET:404 responds with Not Found if user does not exist', () => {
				return request(app)
					.get('/api/users/username')
					.expect(404)
					.then(({ body }) => {
						expect(body.msg).toEqual('User username not found')
					})
			})
		})
	})
})
describe('/api/comments/:comment_id', () => {
	describe('DELETE', () => {
		test('DELETE:204 responds with No Content, removes the passed comment from the database', () => {
			return request(app)
				.delete('/api/comments/1')
				.expect(204)
				.then(() => {
					return db.query(`SELECT * FROM comments`).then(({ rows }) => {
						const verified = rows.some(({ comment_id }) => {
							comment_id === 1
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
	describe('PATCH', () => {
		test('PATCH:200 increases the vote value of a comment by 1 and returns the updated comment', () => {
			return request(app)
				.patch('/api/comments/1')
				.send({ inc_votes: 1 })
				.expect(200)
				.then(({ body }) => {
					expect(body.votes).toBe(17)
				})
		})
		test('PATCH:200 decreases the vote value of an comment by 100 and returns the updated comment', () => {
			return request(app)
				.patch('/api/comments/1')
				.send({ inc_votes: -100 })
				.expect(200)
				.then(({ body }) => {
					expect(body.votes).toBe(-84)
				})
		})
		test('PATCH:404 responds with Not found if that comment_id is valid but doesnt exist', () => {
			return request(app)
				.patch('/api/comments/911')
				.send({ inc_votes: 1 })
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('No comment found for comment_id 911')
				})
		})
		test('PATCH:400 responds with Bad request if given an invalid comment id', () => {
			return request(app)
				.patch('/api/comments/banana')
				.send({ inc_votes: 1 })
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request')
				})
		})
		test('PATCH:400 responds with Bad request if given an invalid body', () => {
			return request(app)
				.patch('/api/comments/1')
				.send({ dave: 1 })
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request, please see ./endpoints')
				})
		})
	})
})

# cb-news README
#northcoders
# CB News API 
### Introduction
CB News is a RESTful API for the purpose of accessing application data programmatically, mimicking a real world backend service (such as Reddit) which should provide this information to the front end architecture.
See it live [here](https://cb-news.onrender.com/api)!
The API uses the [Express](https://expressjs.com/) Node.js web application framework and interacts with the [PSQL](https://www.postgresql.org/download/)database using ~[node-postgres](https://node-postgres.com/)~.
### Project Features
* GET Topics, Articles and Comments
* POST new Comments to an Article
* PATCH existing Articles and Comments
* DELETE comments
* Articles can be up or down voted (comment voting coming soon)

### Installation Guide
* Find the repository [here](https://github.com/chris-butterworth/cb-news) 
* Install and run the [Postgres](https://www.postgresql.org/download/) app.
* Clone using `git clone https://github.com/chris-butterworth/cb-news`
* The main branch is the current working version of the API
* Run `npm install` to install all dependencies
* Create two .env files in your project root folder `.env.test` and`.env.development` Into each, add `PGDATABASE=` with the correct database name for that environment (see /db/setup.sql for the database names).
* Run `npm run seed-dbs` to seed the databases

> Minimum version - Node.js v20.5.1, Postgres v15

### Usage
* Run `npm test app` to run tests
### API Endpoints
| HTTP Verbs | Endpoints                          | Action                                                       |
|------------|------------------------------------|--------------------------------------------------------------|
| GET        | /api                               | Responds with a list of available endpoints                  |
| GET        | /api/topics                        | Responds with a list of topics                               |
| GET        | /api/articles                      | Responds with a list of articles. Accepts queries ‘sort_by’ ‘order’ and ‘topic’ |
| GET        | /api/articles/:article_id          | Responds with a single article by article_id                 |
| PATCH      | /api/articles/:article_id          | Used to add votes to an article by article_id                             |
| GET        | /api/articles/:article_id/comments | Responds with a list of comments by article_id               |
| POST       | /api/articles/:article_id/comments | Add a comment by article_id                                  |
| PATCH      | /api/articles/:article_id/comments | Used to add votes to a comment by comment_id                            |
| DELETE     | /api/comments/:comment_id          | Deletes a comment by comment_id                              |
| GET        | /api/users                          | Responds with a list of users             |
| GET        | /api/users/:username              | Responds with a single user               |
### Technologies Used
* [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
* [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
* [PostgreSQL](https://www.postgresql.org/)~ is an advanced, enterprise class open source relational database that supports both SQL (relational) and JSON (non-relational) querying. 
### Authors
* [Chris Butterworth](https://github.com/chris-butterworth)
import pg from 'pg'
const { Client } = pg
const client = new Client({
  user: 'postgres',
  password: 'ubuntu',
  host: 'localhost',
  port: 5432,
  database: 'makeRepos',
})
await client.connect()

export default client;

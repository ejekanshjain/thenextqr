import { readFile } from 'fs/promises'
import pg from 'pg'

const main = async () => {
  const fn_get_trial_period_end = await readFile(
    './db/fn_get_trial_period_end.sql',
    'utf-8'
  )

  const pgClient = new pg.Client({
    connectionString:
      'postgresql://postgres:lol@localhost:5432/thenextqr'
  })

  await pgClient.connect()

  console.log(await pgClient.query(fn_get_trial_period_end))

  await pgClient.end()
}

main()

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'v2-multi-tenant.sql'), 'utf-8')

const client = new pg.Client({
  host: '10.28.28.97',
  port: 5433,
  user: 'supabase_admin',
  password: 'VayyOQHr6ghRh4xnfRosVNkR',
  database: 'postgres',
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to Cognabase R740xd')

    const result = await client.query(sql)
    console.log('Migration completed successfully')

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_profiles', 'notifications', 'seo_clients')
      ORDER BY table_name
    `)
    console.log('Verified tables:', rows.map(r => r.table_name))

    // Check new columns on seo_clients
    const { rows: cols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'seo_clients'
      AND column_name IN ('owner_clerk_id', 'color')
    `)
    console.log('Verified new columns on seo_clients:', cols.map(c => c.column_name))

    // Count seeded records
    const { rows: seedCount } = await client.query(
      `SELECT COUNT(*) as count FROM seo_clients WHERE owner_clerk_id IS NULL`
    )
    console.log('Admin-owned (seeded) clients:', seedCount[0].count)

  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()

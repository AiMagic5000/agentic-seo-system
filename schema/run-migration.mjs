import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: '10.28.28.97',
  port: 5433,
  user: 'supabase_admin',
  password: 'VayyOQHr6ghRh4xnfRosVNkR',
  database: 'postgres',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Cognabase R740xd');

    const sql = readFileSync(new URL('./migration.sql', import.meta.url), 'utf8');

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let errors = 0;

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        success++;
      } catch (err) {
        // Skip "already exists" errors
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`SKIP (exists): ${stmt.substring(0, 60)}...`);
        } else {
          console.error(`ERROR: ${err.message}`);
          console.error(`  Statement: ${stmt.substring(0, 80)}...`);
          errors++;
        }
      }
    }

    console.log(`\nMigration complete: ${success} statements succeeded, ${errors} errors`);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

run();

import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  host: 'db.xyjdoinkewfpndwwqunu.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Jungleoflions7$',
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    // Read migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/202606290001_initial_schema.sql', 'utf8');
    console.log('Running migration...');

    // Split by semicolon but handle $$ dollar-quoted strings
    const statements = [];
    let current = '';
    let inDollarQuote = false;
    let dollarChar = '';

    for (const char of migrationSQL) {
      if (char === '$' && !inDollarQuote) {
        inDollarQuote = true;
        dollarChar = '$';
      } else if (char === '$' && inDollarQuote && dollarChar === '$') {
        inDollarQuote = false;
        dollarChar = '';
      }
      current += char;
      if (char === ';' && !inDollarQuote) {
        if (current.trim()) statements.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) statements.push(current.trim());

    // Execute each statement
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✓ Executed:', statement.slice(0, 50) + '...');
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error('Error:', err.message);
        }
      }
    }

    // Add players
    console.log('Adding players...');
    const players = ['Cameron', 'Irina', 'Prithu', 'Gopal'];
    for (const name of players) {
      try {
        await client.query('INSERT INTO players (name) VALUES ($1)', [name]);
        console.log(`✓ Added player: ${name}`);
      } catch (err) {
        if (err.message.includes('duplicate')) {
          console.log(`Player ${name} already exists`);
        } else {
          console.error(`Error adding ${name}:`, err.message);
        }
      }
    }

    // Set up cron
    console.log('Setting up cron...');
    const cronSQL = `
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      CREATE EXTENSION IF NOT EXISTS pg_net;

      SELECT cron.schedule(
        'pickem-sync-fixtures-hourly',
        '7 * * * *',
        $$SELECT net.http_get(
          url := 'https://world-cup-pickem-w7wy.vercel.app/api/cron/fixtures',
          headers := '{"Authorization": "Bearer worldcup-cron-secret-2026-very-secure-key"}',
          timeout_milliseconds := 60000
        );$$
      );

      SELECT cron.schedule(
        'pickem-sync-results',
        '*/10 * * * *',
        $$SELECT net.http_get(
          url := 'https://world-cup-pickem-w7wy.vercel.app/api/cron/results',
          headers := '{"Authorization": "Bearer worldcup-cron-secret-2026-very-secure-key"}',
          timeout_milliseconds := 60000
        );$$
      );
    `;

    try {
      await client.query(cronSQL);
      console.log('✓ Cron triggers set up');
    } catch (err) {
      console.log('Cron setup skipped (may need pg_cron extension):', err.message);
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nNow go to https://world-cup-pickem-w7wy.vercel.app/admin');
    console.log('and click "Sync Fixtures" to pull in the World Cup matches!');

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

setup();

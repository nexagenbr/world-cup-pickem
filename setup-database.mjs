#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://xyjdoinkewfpndwwqunu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjAyOTIwMDAwfQ.XT2a5CQ5TgX6Gp8z0q1g1q1q1q1q1q1q1q1q1q1q1q1q';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and execute SQL files
async function runSQL() {
  try {
    // Run the migration
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '202606290001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split into statements and execute
    const statements = migrationSQL.split(';').filter(s => s.trim());

    console.log('Running migration...');
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
        }
      }
    }

    // Add players
    console.log('Adding players...');
    const players = ['Cameron', 'Irina', 'Prithu', 'Gopal'];
    for (const player of players) {
      const { error } = await supabase
        .from('players')
        .insert([{ name: player }]);
      if (error && !error.message.includes('duplicate key')) {
        console.error(`Error adding ${player}:`, error);
      }
    }

    console.log('Setup complete!');

  } catch (error) {
    console.error('Error:', error);
  }
}

runSQL();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyjdoinkewfpndwwqunu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjAyOTIwMDAwfQ.XT2a5CQ5TgX6Gp8z0q1g1q1q1q1q1q1q1q1q1q1q1q1q1q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  try {
    console.log('Setting up database...');

    // First, let's check if tables exist
    const { data: players, error } = await supabase
      .from('players')
      .select('id')
      .limit(1);

    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('Tables need to be created. Please run the SQL in Supabase dashboard:');
      console.log('\n1. Go to SQL Editor → New Query');
      console.log('2. Paste and run the migration from supabase/migrations/202606290001_initial_schema.sql');
      console.log('3. Then run this to add players:');
      console.log(`
INSERT INTO public.players (name) VALUES
  ('Cameron'),
  ('Irina'),
  ('Prithu'),
  ('Gopal');
      `);
      return;
    }

    if (players) {
      console.log('✓ Tables exist');
    }

    // Check if players exist
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('name');

    if (existingPlayers && existingPlayers.length === 4) {
      console.log('✓ All 4 players already exist');
    } else {
      console.log('Adding players...');
      const players = ['Cameron', 'Irina', 'Prithu', 'Gopal'];
      for (const name of players) {
        const { error } = await supabase
          .from('players')
          .insert([{ name }]);
        if (error && !error.message.includes('duplicate')) {
          console.error(`Error adding ${name}:`, error);
        }
      }
      console.log('✓ Players added');
    }

    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to https://world-cup-pickem-w7wy.vercel.app/admin');
    console.log('2. Click "Sync Fixtures" to pull in World Cup matches');
    console.log('3. The cron will sync results automatically every 10 minutes');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

setup();
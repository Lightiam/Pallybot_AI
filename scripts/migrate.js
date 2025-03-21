import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        
        // Continue with other migrations even if one fails
        console.log('Continuing with remaining migrations...');
      } else {
        console.log(`Successfully ran migration: ${file}`);
      }
    }
    
    console.log('Migrations completed');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function if it doesn\'t exist...');
    
    const { error } = await supabase.rpc('create_exec_sql_function', {});
    
    if (error) {
      // If the function already exists, this is fine
      if (error.message.includes('already exists')) {
        console.log('exec_sql function already exists');
      } else {
        console.error('Error creating exec_sql function:', error);
        
        // Create the function manually
        const { error: manualError } = await supabase.sql(`
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        
        if (manualError) {
          console.error('Error creating exec_sql function manually:', manualError);
          process.exit(1);
        } else {
          console.log('Successfully created exec_sql function manually');
        }
      }
    } else {
      console.log('Successfully created exec_sql function');
    }
  } catch (error) {
    console.error('Error creating exec_sql function:', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Create the exec_sql function
    await createExecSqlFunction();
    
    // Run migrations
    await runMigrations();
    
    console.log('Migration process completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

main();
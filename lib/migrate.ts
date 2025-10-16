import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function migrate() {
  console.log('Starting migration...');

  try {
    // Add status column to brands if it doesn't exist
    await sql`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED'
    `;
    console.log('Added status column to brands table');

    // Add status column to models if it doesn't exist
    await sql`
      ALTER TABLE models 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED'
    `;
    console.log('Added status column to models table');

    // Update all existing brands and models to APPROVED status
    await sql`
      UPDATE brands SET status = 'APPROVED' WHERE status IS NULL
    `;
    await sql`
      UPDATE models SET status = 'APPROVED' WHERE status IS NULL
    `;
    console.log('Updated existing records to APPROVED status');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

migrate();


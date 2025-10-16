import bcrypt from 'bcryptjs';
import { initDatabase, createUser, createBrand, createModel } from './db';

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

async function seed() {
  console.log('Starting database seed...');

  // Initialize database schema
  await initDatabase();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await createUser(
    'admin@nietladenindepiek.nl',
    hashedPassword,
    'Admin',
    ['MODERATOR', 'CATALOG_MANAGER', 'USER_ADMIN']
  );
  console.log('Created admin user');

  // Create sample brands
  const tesla = await createBrand('Tesla', 'tesla');
  const volkswagen = await createBrand('Volkswagen', 'volkswagen');
  const bmw = await createBrand('BMW', 'bmw');
  const nissan = await createBrand('Nissan', 'nissan');
  console.log('Created sample brands');

  // Create sample models
  await createModel(tesla.id, 'Model 3', 'model-3', '2017-heden');
  await createModel(tesla.id, 'Model Y', 'model-y', '2020-heden');
  await createModel(tesla.id, 'Model S', 'model-s', '2012-heden');
  await createModel(tesla.id, 'Model X', 'model-x', '2015-heden');

  await createModel(volkswagen.id, 'ID.3', 'id3', '2020-heden');
  await createModel(volkswagen.id, 'ID.4', 'id4', '2021-heden');
  await createModel(volkswagen.id, 'ID.5', 'id5', '2021-heden');

  await createModel(bmw.id, 'i3', 'i3', '2013-2022');
  await createModel(bmw.id, 'i4', 'i4', '2021-heden');
  await createModel(bmw.id, 'iX', 'ix', '2021-heden');

  await createModel(nissan.id, 'Leaf', 'leaf', '2010-heden');
  await createModel(nissan.id, 'Ariya', 'ariya', '2022-heden');

  console.log('Created sample models');
  console.log('Seed completed!');
  console.log('\nAdmin credentials:');
  console.log('Email: admin@nietladenindepiek.nl');
  console.log('Password: admin123');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});


import { sql } from '@vercel/postgres';

// Database initialization
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        roles TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create brands table
    await sql`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        logo_url TEXT,
        status VARCHAR(50) DEFAULT 'APPROVED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create models table
    await sql`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        year_range VARCHAR(50),
        slug VARCHAR(255) NOT NULL,
        reference_model_id INTEGER REFERENCES models(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'APPROVED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, slug)
      )
    `;

    // Create guides table
    await sql`
      CREATE TABLE IF NOT EXISTS guides (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50) DEFAULT 'PENDING',
        submitted_by_name VARCHAR(255) NOT NULL,
        submitted_by_email VARCHAR(255),
        approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create guide_models junction table (many-to-many)
    await sql`
      CREATE TABLE IF NOT EXISTS guide_models (
        id SERIAL PRIMARY KEY,
        guide_id INTEGER REFERENCES guides(id) ON DELETE CASCADE,
        model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guide_id, model_id)
      )
    `;

    // Create guide_steps table
    await sql`
      CREATE TABLE IF NOT EXISTS guide_steps (
        id SERIAL PRIMARY KEY,
        guide_id INTEGER REFERENCES guides(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_models_guide_id ON guide_models(guide_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_models_model_id ON guide_models(model_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_steps_guide_id ON guide_steps(guide_id)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// User queries
export async function createUser(email: string, password: string, name: string, roles: string[] = []) {
  const rolesArray = `{${roles.join(',')}}`;
  const result = await sql`
    INSERT INTO users (email, password, name, roles)
    VALUES (${email}, ${password}, ${name}, ${rolesArray}::text[])
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.rows[0] || null;
}

export async function getAllUsers() {
  const result = await sql`
    SELECT id, email, name, roles, created_at FROM users
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function updateUserRoles(userId: number, roles: string[]) {
  const rolesArray = `{${roles.join(',')}}`;
  const result = await sql`
    UPDATE users SET roles = ${rolesArray}::text[], updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const result = await sql`
    UPDATE users SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING *
  `;
  return result.rows[0];
}

// Brand queries
export async function getAllBrands(includeAll = false) {
  const result = includeAll
    ? await sql`SELECT * FROM brands ORDER BY name ASC`
    : await sql`SELECT * FROM brands WHERE status = 'APPROVED' ORDER BY name ASC`;
  return result.rows;
}

export async function getAllBrandsWithGuideCount(includeAll = false): Promise<Brand[]> {
  const result = includeAll
    ? await sql`
        SELECT b.*, 
               COUNT(DISTINCT g.id) as guide_count
        FROM brands b
        LEFT JOIN models m ON b.id = m.brand_id
        LEFT JOIN guide_models gm ON m.id = gm.model_id
        LEFT JOIN guides g ON gm.guide_id = g.id AND g.status = 'APPROVED'
        GROUP BY b.id
        ORDER BY b.name ASC
      `
    : await sql`
        SELECT b.*, 
               COUNT(DISTINCT g.id) as guide_count
        FROM brands b
        LEFT JOIN models m ON b.id = m.brand_id
        LEFT JOIN guide_models gm ON m.id = gm.model_id
        LEFT JOIN guides g ON gm.guide_id = g.id AND g.status = 'APPROVED'
        WHERE b.status = 'APPROVED'
        GROUP BY b.id
        ORDER BY b.name ASC
      `;
  return result.rows as Brand[];
}

export async function getBrandBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM brands WHERE slug = ${slug}
  `;
  return result.rows[0] || null;
}

export async function createBrand(name: string, slug: string, logoUrl?: string, status: string = 'APPROVED') {
  const result = await sql`
    INSERT INTO brands (name, slug, logo_url, status)
    VALUES (${name}, ${slug}, ${logoUrl || null}, ${status})
    RETURNING *
  `;
  return result.rows[0];
}

export async function approveBrand(id: number) {
  const result = await sql`
    UPDATE brands SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateBrand(id: number, name: string, slug: string, logoUrl?: string) {
  const result = await sql`
    UPDATE brands SET name = ${name}, slug = ${slug}, logo_url = ${logoUrl || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteBrand(id: number) {
  const result = await sql`
    DELETE FROM brands WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getBrandById(id: number) {
  const result = await sql`
    SELECT * FROM brands WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

// Model queries
export async function getModelsByBrand(brandId: number, includeAll = false) {
  const result = includeAll
    ? await sql`SELECT * FROM models WHERE brand_id = ${brandId} ORDER BY name ASC`
    : await sql`SELECT * FROM models WHERE brand_id = ${brandId} AND status = 'APPROVED' ORDER BY name ASC`;
  return result.rows;
}

export async function getModelBySlug(brandSlug: string, modelSlug: string) {
  const result = await sql`
    SELECT m.*, b.name as brand_name, b.slug as brand_slug
    FROM models m
    JOIN brands b ON m.brand_id = b.id
    WHERE b.slug = ${brandSlug} AND m.slug = ${modelSlug}
  `;
  return result.rows[0] || null;
}

export async function createModel(brandId: number, name: string, slug: string, yearRange?: string, referenceModelId?: number, status: string = 'APPROVED') {
  const result = await sql`
    INSERT INTO models (brand_id, name, slug, year_range, reference_model_id, status)
    VALUES (${brandId}, ${name}, ${slug}, ${yearRange || null}, ${referenceModelId || null}, ${status})
    RETURNING *
  `;
  return result.rows[0];
}

export async function approveModel(id: number) {
  const result = await sql`
    UPDATE models SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateModel(id: number, name: string, slug: string, yearRange?: string, referenceModelId?: number) {
  const result = await sql`
    UPDATE models SET name = ${name}, slug = ${slug}, year_range = ${yearRange || null}, 
           reference_model_id = ${referenceModelId || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteModel(id: number) {
  await sql`DELETE FROM models WHERE id = ${id}`;
}

// Guide queries
export async function getGuidesByModel(modelId: number, status: string = 'APPROVED') {
  const result = await sql`
    SELECT g.*, 
           EXTRACT(YEAR FROM g.created_at) as year
    FROM guides g
    JOIN guide_models gm ON g.id = gm.guide_id
    WHERE gm.model_id = ${modelId} AND g.status = ${status}
    ORDER BY g.helpful_count DESC, g.created_at DESC
  `;
  return result.rows;
}

export interface GuideWithSteps {
  id: number;
  submitted_by_name: string;
  submitted_by_email: string;
  status: string;
  created_at: string;
  approved_by_user_id?: number;
  approved_by_name?: string;
  helpful_count: number;
  not_helpful_count: number;
  steps: {
    id: number;
    guide_id: number;
    step_number: number;
    description: string;
    image_url?: string;
  }[];
  models: {
    id: number;
    name: string;
    brand_name: string;
    brand_slug: string;
    brand_status: string;
    status: string;
  }[];
}

export async function getGuideById(guideId: number) {
  const result = await sql`
    SELECT g.*,
           u.name as approved_by_name
    FROM guides g
    LEFT JOIN users u ON g.approved_by_user_id = u.id
    WHERE g.id = ${guideId}
  `;
  return result.rows[0] || null;
}

export async function getGuideWithSteps(guideId: number): Promise<GuideWithSteps | null> {
  const guide = await getGuideById(guideId);
  if (!guide) return null;

  const steps = await sql`
    SELECT * FROM guide_steps
    WHERE guide_id = ${guideId}
    ORDER BY step_number ASC
  `;

  const models = await sql`
    SELECT m.*, b.name as brand_name, b.slug as brand_slug, b.status as brand_status
    FROM models m
    JOIN brands b ON m.brand_id = b.id
    JOIN guide_models gm ON m.id = gm.model_id
    WHERE gm.guide_id = ${guideId}
  `;

  return {
    ...guide,
    steps: steps.rows,
    models: models.rows,
  } as GuideWithSteps;
}

export interface Guide {
  id: number;
  submitted_by_name: string;
  submitted_by_email: string;
  model_names: string[];
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  status: string;
  guide_count: number;
  created_at: string;
  updated_at: string;
}

export async function getPendingGuides(): Promise<Guide[]> {
  const result = await sql`
    SELECT g.*,
           ARRAY_AGG(m.name || ' (' || b.name || ')') as model_names
    FROM guides g
    JOIN guide_models gm ON g.id = gm.guide_id
    JOIN models m ON gm.model_id = m.id
    JOIN brands b ON m.brand_id = b.id
    WHERE g.status = 'PENDING'
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `;
  return result.rows as Guide[];
}

export async function createGuide(
  submittedByName: string,
  submittedByEmail: string | null,
  modelIds: number[],
  steps: Array<{ stepNumber: number; description: string; imageUrl?: string }>
) {
  // Create guide
  const guideResult = await sql`
    INSERT INTO guides (submitted_by_name, submitted_by_email, status)
    VALUES (${submittedByName}, ${submittedByEmail}, 'PENDING')
    RETURNING *
  `;
  const guide = guideResult.rows[0];

  // Link to models
  for (const modelId of modelIds) {
    await sql`
      INSERT INTO guide_models (guide_id, model_id)
      VALUES (${guide.id}, ${modelId})
    `;
  }

  // Create steps
  for (const step of steps) {
    await sql`
      INSERT INTO guide_steps (guide_id, step_number, description, image_url)
      VALUES (${guide.id}, ${step.stepNumber}, ${step.description}, ${step.imageUrl || null})
    `;
  }

  return guide;
}

export async function approveGuide(guideId: number, approvedByUserId: number) {
  const result = await sql`
    UPDATE guides 
    SET status = 'APPROVED', approved_by_user_id = ${approvedByUserId}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${guideId}
    RETURNING *
  `;
  return result.rows[0];
}

export async function rejectGuide(guideId: number) {
  const result = await sql`
    UPDATE guides 
    SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${guideId}
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateGuideFeedback(guideId: number, isHelpful: boolean) {
  if (isHelpful) {
    await sql`
      UPDATE guides SET helpful_count = helpful_count + 1
      WHERE id = ${guideId}
    `;
  } else {
    await sql`
      UPDATE guides SET not_helpful_count = not_helpful_count + 1
      WHERE id = ${guideId}
    `;
  }
}


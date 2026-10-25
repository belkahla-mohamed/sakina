const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.resolve(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error('No DATABASE_URL found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: match[1].trim(),
  ssl: { rejectUnauthorized: false },
});

const defaultReviews = [
  {
    name: 'Salma',
    city: 'Casablanca',
    rating: 5,
    text: "Livraison super rapide à Casablanca et le plaid est encore plus doux qu'en photo. J'en ai commandé un deuxième pour mon frère.",
    status: 'approved',
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    name: 'Nadia',
    city: 'Rabat',
    rating: 5,
    text: 'Je commande depuis 3 mois : toujours le même sérieux, et je paie à la livraison sans souci.',
    status: 'approved',
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    name: 'Imane',
    city: 'Marrakech',
    rating: 5,
    text: "Le diffuseur d'arôme sent divin, et l'emballage est parfait pour offrir. Je recommande.",
    status: 'approved',
    created_at: '2026-09-05T09:15:00Z',
  },
];

async function seed() {
  const existing = await pool.query('SELECT count(*) FROM public.reviews');
  console.log('Existing count in public.reviews:', existing.rows[0].count);

  if (Number(existing.rows[0].count) === 0) {
    for (const r of defaultReviews) {
      await pool.query(
        'INSERT INTO public.reviews (name, city, rating, text, status, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [r.name, r.city, r.rating, r.text, r.status, r.created_at]
      );
    }
    console.log('Successfully inserted default reviews into DB!');
  } else {
    console.log('Table already has reviews. Existing rows:', existing.rows[0].count);
  }

  const all = await pool.query('SELECT id, name, city, rating, status, created_at FROM public.reviews ORDER BY id ASC');
  console.log('Current reviews in DB:', all.rows);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

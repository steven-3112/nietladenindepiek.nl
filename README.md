# Niet Laden in de Piek

A crowdsourced platform to help EV owners configure their cars to avoid charging during peak hours (4PM-9PM), supporting the energy transition.

## Features

- 🏠 Homepage with car selector
- 📚 Guide viewer with multiple guides per model
- 📝 Public submission form for new guides
- 👍 Feedback system (helpful/not helpful)
- 🔐 Admin system with role-based access control
- ✅ Guide approval workflow with email notifications
- 🚗 Brand and model management
- 👥 User management with roles

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Vercel Postgres
- **Authentication:** NextAuth.js
- **Image Storage:** Cloudinary
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=your_vercel_postgres_url

# NextAuth
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# reCAPTCHA (optional for now)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

### 3. Database Setup

Run the seed script to initialize the database:

```bash
npx tsx lib/seed.ts
```

This will create:
- Database tables
- Admin user (email: `admin@nietladenindepiek.nl`, password: `admin123`)
- Sample brands and models

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

**Default admin credentials:**
- Email: `admin@nietladenindepiek.nl`
- Password: `admin123`

⚠️ **Change this password in production!**

### Admin Roles

- **MODERATOR:** Review and approve/reject submitted guides
- **CATALOG_MANAGER:** Manage car brands and models
- **USER_ADMIN:** Manage users and assign roles

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── (public routes)
│   │   ├── page.tsx       # Homepage
│   │   ├── handleiding/   # Guide viewer
│   │   └── indienen/      # Submit guide
│   ├── admin/             # Protected admin pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities
│   ├── db.ts             # Database queries
│   ├── auth.ts           # Auth configuration
│   ├── cloudinary.ts     # Image upload
│   └── email.ts          # Email sending
└── types/                # TypeScript types
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database

Create a Vercel Postgres database and run the seed script in production:

```bash
vercel env pull .env.local
npx tsx lib/seed.ts
```

## Development Guidelines

See `.cursorrules` for coding standards:
- Code in English
- UI text in Dutch
- TypeScript for type safety
- Clean code principles (DRY, SOLID, KISS)

## Contributing

Contributions are welcome! Please follow the coding standards defined in `.cursorrules`.

## License

MIT


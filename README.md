# Diganta Biswas — Portfolio

Personal portfolio for Diganta Biswas, a MERN Stack Developer based in Kolkata, India. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Personal introduction, skills, experience, education, and profile photo.
- Published projects with individual detail pages.
- Certificate gallery and public text guestbook.
- Private contact messages and a protected admin dashboard.
- Admin controls for projects, publishing, certificates, comments, and inbox messages.
- Static portfolio and email-draft fallback when Supabase is not configured.

## Run locally

Use Node.js 22 or newer.

```bash
git clone https://github.com/Diganta18-noob/portfolio.git
cd portfolio
npm ci --legacy-peer-deps
npm run dev
```

The terminal prints the local preview URL.

## Configure Supabase

Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Apply [supabase/setup.sql](supabase/setup.sql), optionally add your projects using [supabase/seed.sql](supabase/seed.sql), and create your admin account using [BACKEND-SETUP.md](BACKEND-SETUP.md). Restart Vite after updating environment variables.

Private messages are stored in the admin inbox. Replies open in your email application; automatic email notifications are not configured.

## Personal content

Update [src/portfolioConfig.js](src/portfolioConfig.js) for personal information, skills, experience, and static projects. With Supabase connected, manage published projects and certificates from the admin dashboard at `/login`.

## Verify and build

```bash
npm test
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Deploy to Vercel

Import this repository, use the `master` branch, and add the two Supabase environment variables before deploying. Build settings and client-side routing are configured in [vercel.json](vercel.json).

See [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md) for the full deployment steps. Local environment files, dependencies, and build output are excluded from Git.

## Contact

- [GitHub](https://github.com/Diganta18-noob)
- [LinkedIn](https://www.linkedin.com/in/digantabiswas/)
- Email: digantab.cse.jisu21@gmail.com

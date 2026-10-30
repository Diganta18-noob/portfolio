# Deploy Diganta's portfolio to Vercel

1. Import https://github.com/Diganta18-noob/portfolio into Vercel.
2. Select the production branch `master` and keep the root directory at the repository root.
3. Vercel reads `vercel.json`: Vite, install `npm ci --legacy-peer-deps`, build `npm run build`, output `dist`. The rewrite supports direct navigation to /login, /dashboard/messages, and /project/... routes.
4. Before the first build, add the two public environment variables from your local .env.local to Vercel's Production and Preview environments:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
5. Deploy. If you add or change variables afterward, redeploy: Vite embeds them at build time. Never add a secret/service-role key.
6. Supabase setup is separate from hosting: apply supabase/setup.sql, optionally seed.sql, and create your admin account as explained in BACKEND-SETUP.md. Set Supabase Auth's Site URL to your deployed domain.

Without the environment variables, the deployed site uses local portfolio data, disables admin login, and opens email drafts instead of storing messages. .env.local is intentionally excluded from Git.

Local checks: npm test and npm run build. No paid hosting or deployment is triggered by pushing this repository.

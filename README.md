# TARS Chat

A real-time one-to-one chat application built for the TARS Full Stack Engineer Internship coding challenge.

## Project overview

TARS Chat lets users sign up, sign in, and send messages in private conversations. Features include:

- **Authentication** (Clerk): sign up, sign in, sign out; user profile synced to Convex on first login
- **User discovery**: list of registered users (excluding yourself) with search by name
- **Conversations**: create or open a 1:1 conversation; messages stored in Convex and shown in real time
- **Conversation list**: recent conversations with last message preview and unread count
- **Typing indicators**: “User is typing…” when the other participant is typing
- **Online status**: green dot for users active in the last 90 seconds
- **Smart auto-scroll**: new messages auto-scroll only when you’re near the bottom; otherwise a “New messages” button appears

All of this runs on free tiers (no credit card required).

## Tech stack

| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router) |
| Language    | TypeScript |
| Database & realtime | Convex |
| Auth        | Clerk |
| Styling     | Tailwind CSS v4 |
| UI components | shadcn/ui (new-york, minimal set) |

## Local setup

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in values as you add services:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From [Clerk Dashboard](https://dashboard.clerk.com) → API Keys. Required for auth. |
| `CLERK_SECRET_KEY` | From Clerk Dashboard → API Keys. Required for auth. |
| `NEXT_PUBLIC_CONVEX_URL` | From Convex (see step 3). Required for database and realtime. |

The app will run without these; add them when you need auth and Convex.

### 3. Convex (database and realtime)

1. Run once to create a Convex project and get your deployment URL:

   ```bash
   npx convex dev
   ```

2. When prompted, log in (or use anonymous dev). Convex will create a `convex/` folder and add a deployment URL to `.env.local` as `NEXT_PUBLIC_CONVEX_URL`. Keep `npx convex dev` running in a separate terminal while developing so Convex stays in sync.

3. **Clerk + Convex auth:** In the [Clerk Dashboard](https://dashboard.clerk.com), go to **JWT Templates** → create a template from the **Convex** preset (name must stay `convex`). Copy the **Issuer URL**. In the [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment Variables**, add:
   - Name: `CLERK_JWT_ISSUER_DOMAIN`
   - Value: the Issuer URL (e.g. `https://your-issuer.clerk.accounts.dev`)

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002). Sign up or sign in, then start a conversation from the user list.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint |

## Deployment notes

### Vercel (recommended)

1. **Push your code** to GitHub (or GitLab/Bitbucket).

2. **Import the project** in [Vercel](https://vercel.com): New Project → Import the repo. Use the default “Next.js” preset and root directory.

3. **Environment variables** (Vercel project → Settings → Environment Variables). Add the same variables as in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`

   For production, use production keys and the production Convex deployment URL (from `npx convex deploy` or Convex Dashboard).

4. **Clerk production URLs:** In Clerk Dashboard → your application → **Domains**, add your Vercel URL (e.g. `https://your-app.vercel.app`). In **Paths** (or **URLs**), set Sign-in and Sign-up URLs if you use custom paths (e.g. `/sign-in`, `/sign-up`).

5. **Convex production:** From your repo (with Convex configured):

   ```bash
   npx convex deploy
   ```

   Use the production Convex URL as `NEXT_PUBLIC_CONVEX_URL` in Vercel. Ensure `CLERK_JWT_ISSUER_DOMAIN` is set in the Convex Dashboard for the production deployment if you use Clerk auth.

6. **Deploy:** Vercel will build and deploy. Subsequent pushes to the main branch trigger new deployments.

### Build

The app builds with:

```bash
npm run build
```

No extra build step is required for Vercel; the default Next.js build is used.

### Free tier usage

- **Vercel**: Hobby plan is free for personal use.
- **Clerk**: Free tier includes monthly active users (MAU) and standard auth features.
- **Convex**: Free tier includes a generous usage quota for development and small production apps.

## Troubleshooting

### "No auth provider found matching the given token"

This means Convex is not accepting the JWT from Clerk because the **issuer** does not match. Fix it like this:

1. **Get your Clerk Issuer URL**  
   In [Clerk Dashboard](https://dashboard.clerk.com) → **JWT Templates** → open the **convex** template (create one from the Convex preset if needed; the name must be `convex`). Copy the **Issuer** URL (e.g. `https://your-app-12.clerk.accounts.dev`).

2. **Set it in Convex**  
   In [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment Variables**, set:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** the Issuer URL you copied (exactly, including `https://`)

3. **Sync Convex**  
   Run `npx convex dev` (or `npx convex deploy`) so the backend picks up the new variable.

4. **Use the same Clerk app**  
   The Clerk app whose API keys are in your `.env.local` must be the same app that has that Issuer URL. If you use a different Clerk application, copy that app’s Issuer from its JWT template and set that as `CLERK_JWT_ISSUER_DOMAIN` in Convex.

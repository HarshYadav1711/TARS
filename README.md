# TARS Chat

One-to-one real-time chat app: Next.js (App Router), TypeScript, Convex, Clerk, Tailwind CSS, shadcn/ui.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in values:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From [Clerk Dashboard](https://dashboard.clerk.com). Required for auth. |
   | `CLERK_SECRET_KEY` | From Clerk Dashboard. Required for auth. |
   | `NEXT_PUBLIC_CONVEX_URL` | Set by running `npx convex dev` once. Required for Convex. |

   The app runs without these; add them when you need authentication and Convex.

3. **Convex** (optional for first run)

   ```bash
   npx convex dev
   ```

   Log in or use anonymous dev, then use the generated URL in `.env.local` as `NEXT_PUBLIC_CONVEX_URL`.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production build
- `npm run lint` – run ESLint

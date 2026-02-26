# TARS Chat

A production-ready realtime one-to-one chat application built with Next.js App Router, Convex, and Clerk.

## Project Overview

TARS Chat provides authenticated realtime messaging between users with a clean, responsive interface. The app uses Convex subscriptions for live updates and Clerk for secure authentication.

## Features

- Clerk authentication (sign in, sign up, sign out)
- Automatic user profile sync to Convex
- User discovery with search and realtime presence indicator
- One-to-one conversation creation/reuse
- Realtime message delivery with Convex subscriptions
- Typing indicator with inactivity timeout
- Unread badge counts per conversation
- Smart auto-scroll with `New messages` affordance
- Responsive conversation list and chat view
- Empty, loading, and error UI states for key flows

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Convex (database + realtime)
- Clerk (authentication)

## Architecture Overview

- `src/app/`: route-level orchestration and page composition
- `src/components/`: shared UI and feature components
- `src/components/chat/`: chat feature modules (`ChatHeader`, `ChatMessages`, `MessageInput`, `ChatContainer`)
- `src/lib/`: reusable utilities (timestamp formatting, presence helpers)
- `convex/`: backend schema, queries, mutations, and realtime model

## Realtime Implementation Explanation

Realtime behavior is powered by Convex `useQuery` subscriptions:

- Conversation sidebar updates on new messages/unread changes
- Chat message list updates instantly when messages are inserted
- Typing and presence indicators react to live mutation updates

No polling is used.

## Convex + Next.js Integration

- `ConvexProviderWithClerk` is mounted in `src/app/ConvexClientProvider.tsx`
- `ClerkProvider` wraps the app in `src/app/layout.tsx`
- Convex auth provider is configured in `convex/auth.config.ts`
- Client components call Convex queries/mutations via generated API references

## Deployment Instructions

### 1) Install

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

### 3) Start Convex dev backend

```bash
npx convex dev
```

### 4) Run Next.js app

```bash
npm run dev
```

Open `http://localhost:3002`.

### 5) Production deployment (Vercel)

- Import repo in Vercel
- Set the same env vars in Vercel
- Deploy Convex backend with:

```bash
npx convex deploy
```

- Ensure Clerk production domain and Convex auth config are aligned

## Screenshots

- Add screenshots here:
  - Conversation list
  - Chat view
  - Mobile responsive view
  - Typing + unread indicators

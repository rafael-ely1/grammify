# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npx supabase start` - Start local Supabase instance
- `npx supabase db push` - Push schema changes to database
- `npx supabase db reset` - Reset database

## Environment Variables Required

### Supabase
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string

### OpenAI
- `VITE_OPENAI_API_KEY` - OpenAI API key for text analysis

### Site Configuration
- `VITE_SITE_URL` - Site URL for auth redirects (e.g. http://localhost:5173)

## Architecture

This is a React 18 SaaS application using Vite with clear separation between authenticated and unauthenticated routes.

### Route Structure
- `/src/pages` - All application pages
  - `Dashboard.tsx` - Main authenticated dashboard
  - `Login.tsx` - Login page
  - `Signup.tsx` - Signup page

### Key Patterns
- **State Management** in `/stores` using Zustand
- **Database Schema** in `/supabase/migrations` using SQL
- **UI Components** in `/components` using Tailwind CSS
- **Authentication** handled by Supabase Auth with protected routes
- **Real-time** updates via Supabase Realtime
- **Text Analysis** via OpenAI API

### Data Flow
1. Authentication state managed by Supabase Auth
2. Document data stored in PostgreSQL via Supabase
3. Real-time updates via Supabase Realtime
4. Text analysis performed by OpenAI API
5. State management with Zustand
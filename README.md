# Grammify

A modern writing assistant built with React, TypeScript, and Supabase.

## Features

- Real-time grammar and spell checking
- Document management with auto-save
- User authentication
- Real-time collaboration
- Clean, modern UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your credentials:
```env
# DB
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (for auth redirects)
VITE_SITE_URL=http://localhost:5173

# OpenAI
VITE_OPENAI_API_KEY=sk-your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Tech Stack

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Supabase for backend services
  - Authentication
  - Real-time database
  - Edge Functions
- OpenAI for text analysis

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

MIT

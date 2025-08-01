# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev         # Start Vite dev server on port 5173, opens to /signup
npm run build       # TypeScript compile + Vite production build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint on the codebase
```

### Environment Setup
The application requires Supabase environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

Create a `.env.local` file with these variables before running the application.

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite build tool
- **Styling**: Tailwind CSS with PostCSS
- **Routing**: React Router v6
- **Authentication & Database**: Supabase (PostgreSQL)
- **Notifications**: Sonner toast library

### Application Structure

This is a signup/authentication flow application for Gnymble, a premium SMS platform. The core flow:

1. **Entry Point**: `/src/main.tsx` - Sets up React Router and Sonner toasts
2. **Routing**: `/src/App.tsx` - Defines routes, redirects root to `/signup`
3. **Authentication Pages**:
   - `/src/pages/signup.tsx`: Main signup form with Google OAuth and email/password options
   - `/src/pages/login.tsx`: Login functionality (implementation needed)
4. **Supabase Integration**: `/src/lib/supabaseClient.ts` - Configured Supabase client instance

### Database Schema

The Supabase database (defined in `/supabase/migrations/`) includes:

- **profiles**: User profile data linked to auth.users
- **companies**: Business information for each user
- **user_roles**: Role-based access control (admin, customer, user)

Key features:
- Row Level Security (RLS) enabled on all tables
- Automatic profile and company creation on signup via database trigger
- Users can only view/update their own data

### Authentication Flow

1. **Signup Methods**:
   - Google OAuth integration
   - Email/password with form validation
   
2. **Post-Signup**:
   - Creates user profile automatically via database trigger
   - Redirects to Stripe checkout (hardcoded URL in signup.tsx:91)
   - Assigns default 'user' role

3. **Data Storage**:
   - User metadata (full_name, company_name) passed during signup
   - Stored in profiles and companies tables

### Key Implementation Details

- **Path Aliases**: `@` alias configured for `/src` directory
- **Type Safety**: Strict TypeScript configuration with multiple tsconfig files
- **Component Pattern**: Functional components with React hooks
- **Error Handling**: Toast notifications for user feedback
- **Security**: RLS policies ensure users can only access their own data
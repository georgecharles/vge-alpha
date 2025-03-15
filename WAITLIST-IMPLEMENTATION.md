# VGE Alpha Waitlist Implementation

This document outlines the implementation of the waitlist system for VGE Alpha, which allows potential users to sign up for future access while providing immediate access to developers.

## Overview

The waitlist system consists of:

1. A dedicated waitlist page that serves as the default landing page for unauthenticated users
2. An email submission form that stores interested users in a Supabase database
3. A "Developer Access" option that allows immediate access for development and testing
4. Protected routes that redirect unauthenticated users to the waitlist page

## Setup Instructions

### 1. Supabase Database Setup

Run the provided migration script to create the necessary table in your Supabase project:

```bash
cd supabase
supabase migration up
```

Alternatively, you can manually create the table in the Supabase dashboard using the SQL in `supabase/migrations/20240601_create_waitlist_table.sql`

### 2. Environment Variables

Ensure your `.env` file has the required Supabase configuration variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Developer Access

For development purposes, the system allows immediate access with a hardcoded developer email. In a production environment, you should implement a more secure approach.

The current implementation uses:
- Email: `developer@vgealpha.com`

This can be modified in the `src/lib/auth.tsx` file under the `signInWithEmail` function.

## How It Works

### User Flow

1. Unauthenticated users are directed to the `/waitlist` page
2. Users can submit their email to join the waitlist
3. Developers can click "Developer Access" and use the sign-in option to bypass the waitlist
4. Authenticated users have full access to the application

### Protected Routes

All routes except `/waitlist` and `/auth/callback` are protected by the `PrivateRoute` component, which:

1. Checks if a user is authenticated
2. Redirects unauthenticated users to the waitlist page
3. Allows authenticated users to access the protected content

### Waitlist Database

The waitlist table in Supabase stores:

- User email addresses
- Sign-up timestamp
- Status (`pending`, `invited`, or `joined`)
- Invitation information (when applicable)

## Managing the Waitlist

### Inviting Users

To invite users from the waitlist:

1. Update their status in the `waitlist` table from `pending` to `invited`
2. Set the `invited_at` timestamp
3. Send them an invitation email with instructions to create an account

### Monitoring Signups

You can monitor waitlist signups through:

- Supabase dashboard by querying the `waitlist` table
- Creating an admin panel in your application (implementation not included)

## Future Enhancements

Consider these enhancements for the waitlist system:

1. Email verification for waitlist submissions
2. Admin panel for managing the waitlist
3. Automated invitations based on capacity
4. Referral system that allows users to move up the waitlist
5. Integration with email marketing tools

## Technical Details

The waitlist implementation uses:

- React Router for routing and redirects
- Supabase for authentication and database storage
- React Hook Form with Zod for form validation
- Context API for authentication state management
- Responsive design using Tailwind CSS

For any questions or issues, please refer to the codebase or contact the development team. 
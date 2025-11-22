# Admin Portal Setup Instructions

## Step 1: Create Database Tables

1. Click on the **Cloud** tab in the left sidebar
2. Navigate to **Database** → **SQL Editor**
3. Click **New query**
4. Copy and paste the contents of `setup_admin_portal.sql`
5. Click **Run** to execute the SQL
6. Wait for the types to regenerate (this happens automatically)

## Step 2: Create Your First Admin User

After running the SQL, you need to assign admin role to a user:

1. First, create a user account (or use an existing one) at `/join` or `/apply`
2. In the Supabase SQL Editor, run this query with your email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your-admin-email@example.com';
```

Replace `'your-admin-email@example.com'` with your actual email.

## Step 3: Access the Admin Portal

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. You'll be redirected to the admin dashboard at `/admin/dashboard`

## Admin Portal Features

- **Dashboard**: View metrics including:
  - Total applications
  - Pending applications
  - Approved/rejected applications
  - Today's applications
  
- **Applications List**: View and manage all childminder applications at `/admin/applications`
  - Search by name or email
  - Filter by status (pending, approved, rejected)
  - View detailed application information

## Security Features

- Role-based access control using Supabase RLS policies
- Only users with 'admin' role can access admin pages
- Security definer functions to prevent RLS recursion
- Automatic session validation on all admin routes

## Troubleshooting

If you see TypeScript errors, wait a few seconds for Supabase to regenerate the types after running the SQL, then refresh the preview.

# Rituals App Setup

To get this app fully functional, follow these steps:

## 1. Supabase Backend Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the following script to create the database table:

```sql
-- Create the habits table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text check (category in ('Morning', 'Evening', 'Work')) not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table habits enable row level security;

-- Create a policy so users can only see/edit their own data
create policy "Users can manage their own habits"
  on habits for all
  using (auth.uid() = user_id);
```

3. Go to **Project Settings > API** and copy your:
   - `Project URL`
   - `anon public` Key

## 2. Environment Variables

Create a `.env` file in the root directory and paste your keys:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Deployment

I will deploy this to Vercel for you. If you want to deploy it manually:
1. Push this code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add the environment variables in the Vercel dashboard.

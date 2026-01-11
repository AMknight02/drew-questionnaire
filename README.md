# Drew Mastrino - Decision Reflection

A questionnaire app to help Drew think through his decision about enlisting in the U.S. Marines vs. pursuing a trade career.

## Features

- 38 questions across 8 sections
- Auto-saves answers to Supabase (persistent across devices)
- Progress notifications to parents at key milestones
- Mobile-friendly with sticky navigation
- Marine Corps color scheme (scarlet & gold)

## Deployment Instructions

### 1. Push to GitHub

1. Create a new repository on GitHub (e.g., `drew-questionnaire`)
2. Push this code to the repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drew-questionnaire.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `drew-questionnaire` repository
4. Before deploying, add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qraczxjjtxvlnktumcco.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYWN6eGpqdHh2bG5rdHVtY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjU1NzMsImV4cCI6MjA4Mzc0MTU3M30.4seGux2k0t13CaQQFIppFQ24pv-64ksJij70gn4i4Tw` |
| `RESEND_API_KEY` | `re_2cMJmsnA_F5c4HeXkmU5D5gAmGbtsSLQB` |
| `PARENT_EMAIL_DAD` | `amastrino02@outlook.com` |
| `PARENT_EMAIL_MOM` | `mastr84043@yahoo.com` |

5. Click "Deploy"
6. Once deployed, you'll get a URL like `drew-questionnaire.vercel.app`

### 3. Share with Drew

Text or email Drew the Vercel URL. He can:
- Open it on his phone or computer
- Add it to his home screen for app-like access
- Start, stop, and resume anytime - answers save automatically

## Email Notifications

Parents will receive emails when:
1. **Drew starts** - First answer saved
2. **50% complete** - Halfway milestone
3. **Submitted** - Full answers delivered

## Security Note

After deployment, consider regenerating your API keys since they were shared during setup:
- Resend: Dashboard → API Keys → Delete old, create new
- Update the new key in Vercel environment variables

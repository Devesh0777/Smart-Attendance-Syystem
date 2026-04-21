# Installation Guide for Windows PowerShell

## Step 1: Install PostgreSQL (if not already installed)

Download and install from: https://www.postgresql.org/download/windows/
- Default port: 5432
- Default user: postgres
- Remember the password you set

## Step 2: Create Database

**Option A: Using psql (Recommended)**

```powershell
# Open PostgreSQL command prompt (or use psql in PowerShell if installed)
# Find psql at: C:\Program Files\PostgreSQL\<version>\bin\psql.exe

# Connect to PostgreSQL as admin
# When prompted, enter your postgres password

# In psql, run:
CREATE DATABASE attendance_db;
\q

# Back in PowerShell, verify:
# (this was already done above)
```

**Option B: Direct SQL File**

Create a file `create_db.sql` in the backend folder:
```sql
CREATE DATABASE attendance_db;
```

Then run:
```powershell
# psql -U postgres -f create_db.sql
```

## Step 3: Configure Backend .env

Edit `backend\.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/attendance_db
JWT_SECRET=your_super_secret_jwt_key_12345_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

## Step 4: Initialize Database & Seed Data

```powershell
# PowerShell syntax (use semicolon, not &&)

# Initialize schema
cd backend
npm run db:init

# Seed sample data
npm run seed

# Back to root
cd ..
```

## Step 5: Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend ; npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend ; npm run dev
```

Then open: http://localhost:3000

## PowerShell Tips

- Use `;` to chain commands (not `&&`)
- Wrap paths with spaces in quotes: `"d:\CODINGG PROJECTSSS\attendance"`
- Use `cd ../` or `cd ..` to go up directories
- Press Ctrl+C to stop servers

## Troubleshooting

If psql is not recognized:
1. Find PostgreSQL bin folder: typically `C:\Program Files\PostgreSQL\<version>\bin`
2. Add to PATH or use full path: `& 'C:\Program Files\PostgreSQL\15\bin\psql.exe' -U postgres`

If database creation fails:
1. Make sure PostgreSQL service is running (Services app)
2. Check password is correct
3. Make sure port 5432 is not blocked

# 🪟 WINDOWS QUICK START

## Prerequisites Check

```powershell
node --version   # Should show v16 or higher
npm --version    # Should be installed with Node
```

## Step 1: PostgreSQL Setup

### A) Install PostgreSQL (if not already done)

1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. **Important:** Remember the password you set for the `postgres` user
4. Default port is 5432 (leave as default)

### B) Create Database

The easiest way for Windows is to use SQL commands. Run this:

```powershell
cd "d:\CODINGG PROJECTSSS\attendance\backend"

# Try the automated setup:
npm run db:setup
```

**If that doesn't work**, manually create the database:

1. Find PostgreSQL bin folder (usually: `C:\Program Files\PostgreSQL\15\bin`)
2. Run in PowerShell:
```powershell
$pgPath = 'C:\Program Files\PostgreSQL\15\bin\psql.exe'
& $pgPath -U postgres -c "CREATE DATABASE attendance_db;"
```

## Step 2: Configure Backend

Edit `backend\.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/attendance_db
JWT_SECRET=any_random_string_here_12345
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**Replace `YOUR_PASSWORD`** with the password you set when installing PostgreSQL.

## Step 3: Initialize Database

```powershell
cd "d:\CODINGG PROJECTSSS\attendance\backend"
npm run db:init
```

Expected output: `✅ Database schema initialized successfully!`

## Step 4: Seed Sample Data

```powershell
npm run seed
```

You'll see credentials like:
```
Teacher: alice@school.edu / teacher1
Student: raj@student.edu / student1
```

## Step 5: Start Backend Server

```powershell
npm run dev
```

You should see: `✅ Server running on port 5000`

## Step 6: Start Frontend Server (new PowerShell window)

```powershell
cd "d:\CODINGG PROJECTSSS\attendance\frontend"
npm run dev
```

You should see: `Local:   http://localhost:3000/`

## Step 7: Test the Application

1. Open browser: http://localhost:3000
2. Click "Teacher Login"
3. Email: `alice@school.edu`
4. Password: `teacher1`
5. Click LOGIN ✓

## PowerShell Command Reference

| Task | Command |
|------|---------|
| Navigate to backend | `cd "d:\CODINGG PROJECTSSS\attendance\backend"` |
| Navigate to frontend | `cd "d:\CODINGG PROJECTSSS\attendance\frontend"` |
| Go up one folder | `cd ..` |
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Chain commands | Use `;` not `&&` |
| Stop server | Press `Ctrl + C` |

## Troubleshooting on Windows

### "Cannot find psql" or "createdb not found"
- PostgreSQL tools aren't in PATH
- Solution: Use `npm run db:setup` instead

### "Database connection error"
- Database doesn't exist: Run `npm run db:setup`
- Wrong password in .env: Update with correct password
- PostgreSQL not running: Start from Services (services.msc)
- Wrong port: Check PostgreSQL is on port 5432

### "npm install fails"
```powershell
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install
```

### Hot reload not working
- Kill existing processes: `Get-Process node | Stop-Process`
- Make sure you're using `npm run dev` (not `npm start`)

## File Locations

```
d:\CODINGG PROJECTSSS\attendance\
├── backend\
│   ├── .env              ← Update with your DB password
│   ├── server.js         ← Main API
│   └── package.json
├── frontend\
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432 (not directly accessed)

## Sample Credentials

### Teachers
- Email: `alice@school.edu`
- Password: `teacher1`

**OR**

- Email: `bob@school.edu`
- Password: `teacher2`

### Students
- Email: `raj@student.edu`
- Password: `student1`

**OR**

- Email: `priya@student.edu`
- Password: `student2`

## Next Steps

After getting it running:
1. Explore teacher dashboard
2. Try starting a class and generating QR
3. Log in as student and test QR scanning
4. Check attendance records
5. Review at-risk students

## Getting Help

- See **README.md** for complete documentation
- See **WINDOWS_SETUP.md** for detailed Windows setup
- Check **SETUP_GUIDE.md** for troubleshooting

Happy coding! 🚀

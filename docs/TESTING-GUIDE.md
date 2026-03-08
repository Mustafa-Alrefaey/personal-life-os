# Personal Life OS - Testing Guide

## ✅ What's Been Completed

### Architecture & Infrastructure
- ✅ Clean Architecture solution with 4 projects
- ✅ Domain entities with audit fields and StatusCode
- ✅ Entity Framework Core DbContext with SQL Server
- ✅ ASP.NET Core Identity for authentication
- ✅ Database migration applied successfully
- ✅ Repositories for data access
- ✅ Services for business logic

### Features Implemented
- ✅ **Authentication**: Login, Register, Logout
- ✅ **Dashboard**: Shows task stats, recent tasks, upcoming bills, monthly expenses
- ✅ **Tasks CRUD**: Create, Read, Update, Delete, Complete tasks
- ✅ **UI**: Bootstrap 5 with dark mode toggle
- ✅ **Navigation**: Responsive navbar with user menu

### Database Tables Created
- AspNetUsers (with Identity)
- Tasks
- Bills
- DailyJournals
- Receipts
- Transactions
- MonthlyPayments

---

## 🚀 How to Run the Application

### Step 1: Navigate to Web Project
```bash
cd "F:\Profile\Learning\Personal Life OS\PersonalLifeOS.Web"
```

### Step 2: Run the Application
```bash
dotnet run
```

### Step 3: Open in Browser
The application will start on:
- **HTTPS**: https://localhost:5001
- **HTTP**: http://localhost:5000

Open your browser and go to: **https://localhost:5001**

---

## 🧪 Testing Checklist

### 1. User Registration & Login
- [ ] Go to https://localhost:5001
- [ ] You should see the Login page
- [ ] Click "Register here"
- [ ] Fill in the registration form:
  - Full Name: Your Name
  - Email: test@example.com
  - Password: Test123 (minimum 6 characters)
  - Confirm Password: Test123
- [ ] Click "Register"
- [ ] You should be automatically logged in and redirected to Dashboard

### 2. Dashboard
- [ ] Check that you see:
  - Welcome message
  - Statistics cards (Total Tasks, Completed, Pending - all should be 0)
  - Recent Tasks section (empty)
  - Upcoming Bills section (empty)
  - Monthly Expenses ($0.00)

### 3. Create a Task
- [ ] Click "Tasks" in the navigation bar
- [ ] Click "Create New Task" button
- [ ] Fill in the form:
  - Title: "My First Task"
  - Description: "Testing the task creation"
  - Due Date: Select tomorrow's date
  - Category: "Personal"
- [ ] Click "Create Task"
- [ ] You should see a success message
- [ ] The task should appear in the list

### 4. Task Operations
- [ ] Click "Complete" button on the task
  - Badge should change to green "Completed"
  - Task title should have strikethrough
- [ ] Click "Edit" button
  - Change the title or description
  - Click "Update Task"
  - Changes should be reflected
- [ ] Click "Delete" button
  - Confirm the deletion
  - Task should disappear from the list

### 5. Create Multiple Tasks
- [ ] Create 3-5 more tasks with different:
  - Titles
  - Categories (Work, Personal, Shopping)
  - Due dates
  - Status (mark some as completed)

### 6. Dashboard Verification
- [ ] Go back to Dashboard
- [ ] Verify:
  - Total Tasks count is correct
  - Completed Tasks count is correct
  - Pending Tasks count is correct
  - Recent tasks show up (max 5)

### 7. UI Features
- [ ] Click the moon icon in navbar to toggle dark mode
  - Verify the theme switches between light and dark
  - Refresh the page - theme should persist
- [ ] Click on your name in the navbar
  - Dropdown should appear with "Logout" option
- [ ] Test responsive design
  - Resize browser window
  - Navbar should collapse to hamburger menu on mobile

### 8. Logout & Login
- [ ] Click on your name → Logout
- [ ] You should be redirected to Login page
- [ ] Login with the same credentials
- [ ] You should see your tasks again

---

## ✅ Expected Behavior

### Authentication
- ✔️ Unauthenticated users are redirected to Login
- ✔️ Registration creates a new user and logs them in
- ✔️ Login redirects to Dashboard
- ✔️ Logout redirects to Login page

### Tasks
- ✔️ Tasks are user-specific (each user only sees their own)
- ✔️ Soft delete is implemented (deleted tasks have StatusCode = "Deleted")
- ✔️ Completed tasks show with green badge and strikethrough
- ✔️ Tasks are ordered by creation date (newest first)

### Dashboard
- ✔️ Shows accurate statistics
- ✔️ Recent tasks limited to 5 items
- ✔️ All widgets are responsive

### UI/UX
- ✔️ Dark mode persists across sessions (localStorage)
- ✔️ Bootstrap 5 styling throughout
- ✔️ Responsive design works on mobile
- ✔️ Icons from Bootstrap Icons

---

## 🐛 Known Limitations (MVP)

These are intentionally not implemented yet (Phase 1 focus):

- ❌ Bills CRUD (controllers/views not created yet)
- ❌ Journal CRUD (controllers/views not created yet)
- ❌ Receipts with file upload (controllers/views not created yet)
- ❌ Transactions CRUD (controllers/views not created yet)
- ❌ Arabic language switching (Phase 1 MVP)
- ❌ Background jobs for bill reminders (Phase 3)
- ❌ Comprehensive validation (FluentValidation - Phase 2)
- ❌ Logging to files (Serilog - Phase 2)

---

## 🔍 Troubleshooting

### Issue: Can't connect to database
**Solution:** Make sure LocalDB is running. Run:
```bash
sqllocaldb start MSSQLLocalDB
```

### Issue: Migration fails
**Solution:** Delete the database and re-run:
```bash
cd PersonalLifeOS.Web
dotnet ef database drop --project ../PersonalLifeOS.Infrastructure/PersonalLifeOS.Infrastructure.csproj
dotnet ef database update --project ../PersonalLifeOS.Infrastructure/PersonalLifeOS.Infrastructure.csproj
```

### Issue: Application won't start
**Solution:** Check if port is already in use. You can change the port in `Properties/launchSettings.json`

### Issue: Can't see Bootstrap Icons
**Solution:** Make sure you have internet connection (icons loaded from CDN)

---

## 📊 Database Schema

You can explore the database using SQL Server Management Studio:
- Server: `(localdb)\MSSQLLocalDB`
- Database: `PersonalLifeOSDb`
- Authentication: Windows Authentication

Tables to explore:
- `AspNetUsers` - User accounts
- `Tasks` - User tasks
- `Bills` - Bill reminders (empty for now)
- `Transactions` - Financial transactions (empty for now)

---

## 🎯 Next Steps (After Testing)

Once you've tested and verified everything works:

1. **Phase 1 Remaining** (if needed):
   - Add Bills CRUD
   - Add Transactions CRUD
   - Add Journal CRUD
   - Add Receipts with file upload

2. **Phase 2 - Polish** (from the plan):
   - Add Serilog for file logging
   - Add Data Annotations validation
   - Custom error pages
   - Basic unit tests

3. **Phase 3 - Smart Features**:
   - Hangfire for bill reminders
   - Response caching
   - Health checks

---

## ✨ Success Criteria

Phase 1 MVP is successful if:
- ✅ You can register and login
- ✅ You can create, edit, complete, and delete tasks
- ✅ Dashboard shows accurate statistics
- ✅ Dark mode works and persists
- ✅ UI is responsive
- ✅ No errors in the browser console
- ✅ All data persists after logout/login

---

**Ready to test!** Run `dotnet run` in the PersonalLifeOS.Web folder and start testing! 🚀

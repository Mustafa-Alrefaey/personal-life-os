# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Life OS is a personal productivity platform with a .NET 10 REST API backend and a React + TypeScript frontend. It manages tasks, daily journals, receipts, bills, transactions, and monthly payments for a single authenticated user.

## Commands

### Backend (.NET API)

```bash
# Build entire solution
dotnet build PersonalLifeOS.slnx

# Run the API (runs at http://localhost:5207, Swagger UI at root)
cd PersonalLifeOS.API && dotnet run

# Add a new EF Core migration
cd PersonalLifeOS.Infrastructure && dotnet ef migrations add <MigrationName> --startup-project ../PersonalLifeOS.API

# Apply migrations
cd PersonalLifeOS.Infrastructure && dotnet ef database update --startup-project ../PersonalLifeOS.API
```

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check and build
npm run build

# Lint
npm run lint
```

## Architecture

### Solution Structure

```
PersonalLifeOS.Domain/          # Entities, enums — no dependencies on other layers
PersonalLifeOS.Application/     # DTOs, no business logic services (services live in Infrastructure)
PersonalLifeOS.Infrastructure/  # EF Core DbContext, repositories, services, file storage, Identity
PersonalLifeOS.API/             # ASP.NET Core Web API — thin controllers only
frontend/                       # React SPA
```

**Note:** Services are currently in `PersonalLifeOS.Infrastructure/Services/` rather than the Application layer. Repositories are concrete classes (not interface-based) registered directly in `Program.cs`.

### Backend Key Conventions

- **StatusCode pattern:** All entities use a string `StatusCode` field instead of boolean flags (`IsDeleted`, `IsPaid`, etc.). Common values: `"Pending"`, `"InProgress"`, `"IsCompleted"`, `"Deleted"`, `"Active"`.
- **Soft deletes:** Tasks and Receipts are soft-deleted by setting `StatusCode = "Deleted"`. Queries must always filter `StatusCode != "Deleted"`.
- **Audit fields:** Every entity has `CreatedBy`, `CreatedDate`, `UpdatedBy`, `UpdatedDate`.
- **User scoping:** All data is scoped to the authenticated user via `UserId`. Controllers extract `UserId` from JWT claims using `User.FindFirstValue(ClaimTypes.NameIdentifier)`.
- **API response wrapper:** All endpoints return `ApiResponse<T>` from `PersonalLifeOS.Application/DTOs/ApiResponse.cs`.
- **One journal per day:** `DailyJournal` has a unique index on `(UserId, Date)`.
- **File storage:** Receipt images stored at `wwwroot/uploads/receipts/`.

### API Endpoints

- `POST /api/auth/register` — Register (no auth required)
- `POST /api/auth/login` — Login, returns JWT token (no auth required)
- `GET /api/dashboard` — Dashboard summary stats
- `GET|POST /api/tasks` — List/create tasks
- `GET|PUT|DELETE /api/tasks/{id}` — Get/update/delete task
- `POST /api/tasks/{id}/complete` — Mark task complete

Controllers for Bills, Journal, Receipts, Transactions are planned but not yet created.

### Frontend Key Conventions

- **State management:** Zustand stores in `src/stores/` — `authStore.ts` (user/JWT), `themeStore.ts` (dark mode).
- **API client:** Axios instance in `src/services/api.ts` with base URL `http://localhost:5207/api`. JWT token is automatically injected from `localStorage` via request interceptor. 401 responses redirect to `/login`.
- **Data fetching:** TanStack Query (`@tanstack/react-query`) for server state.
- **Routing:** React Router v7 with `ProtectedRoute` wrapper in `src/components/layout/ProtectedRoute.tsx`.
- **Styling:** Tailwind CSS v4.
- **Auth persistence:** JWT token stored in `localStorage` under key `"token"`. User object stored under `"user"`.

### Database

- SQL Server LocalDB for development: `(localdb)\MSSQLLocalDB` / database `PersonalLifeOSDb`
- EF Core with `ApplicationDbContext` extending `IdentityDbContext<ApplicationUser>`
- Migrations live in `PersonalLifeOS.Infrastructure/Migrations/`

### Authentication

JWT Bearer authentication. Settings in `appsettings.json` under `JwtSettings` (SecretKey, Issuer, Audience, ExpiryInMinutes). CORS allows origins `http://localhost:5173` and `http://localhost:3000`.

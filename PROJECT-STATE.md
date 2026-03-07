# Personal Life OS — Complete Project State

> **Last Updated:** March 6, 2026  
> **Status:** Active Development  
> **Runtime:** .NET 10 + React 19 + TypeScript

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Solution Architecture](#2-solution-architecture)
3. [Backend — .NET API](#3-backend--net-api)
   - [Project References & Packages](#31-project-references--packages)
   - [Domain Entities](#32-domain-entities)
   - [Enums & Constants](#33-enums--constants)
   - [DTOs (Data Transfer Objects)](#34-dtos-data-transfer-objects)
   - [Repositories](#35-repositories)
   - [Services](#36-services)
   - [Controllers & API Endpoints](#37-controllers--api-endpoints)
   - [Identity & Authentication](#38-identity--authentication)
   - [Database & Persistence](#39-database--persistence)
   - [File Storage](#310-file-storage)
   - [Configuration](#311-configuration)
   - [Middleware Pipeline](#312-middleware-pipeline)
4. [Frontend — React SPA](#4-frontend--react-spa)
   - [Tech Stack & Dependencies](#41-tech-stack--dependencies)
   - [Build & Config Files](#42-build--config-files)
   - [Entry Point & Routing](#43-entry-point--routing)
   - [Pages](#44-pages)
   - [Layout Components](#45-layout-components)
   - [UI Components](#46-ui-components)
   - [State Management (Zustand Stores)](#47-state-management-zustand-stores)
   - [API Services](#48-api-services)
   - [TypeScript Types](#49-typescript-types)
   - [Internationalization (i18n)](#410-internationalization-i18n)
   - [Utilities](#411-utilities)
   - [Design System & CSS Tokens](#412-design-system--css-tokens)
5. [Database Schema](#5-database-schema)
6. [Feature Matrix](#6-feature-matrix)

---

## 1. Project Overview

**Personal Life OS** is a single-user personal productivity platform for managing:

- **Tasks** — with priorities (High/Medium/Low), categories, due dates, status tracking
- **Bills** — payment tracking with due dates, amounts, reminders, paid/pending status
- **Daily Journal** — date-based diary entries with rich text notes
- **Receipts** — with image upload, categories, amounts
- **Transactions** — income/expense tracking with categories and notes
- **Dashboard** — aggregate stats, recent tasks, upcoming bills, financial summary

**Architecture:** Clean Architecture (4-layer .NET solution) + React SPA  
**Auth:** JWT Bearer tokens (60-minute expiry)  
**Database:** SQL Server LocalDB with EF Core  
**Localization:** English + Arabic with full RTL support  
**Theme:** Light/Dark mode with CSS custom properties  
**Font:** Tajawal (Google Fonts)  
**Currency:** EGP (Egyptian Pound)

---

## 2. Solution Architecture

```
PersonalLifeOS.slnx
├── PersonalLifeOS.Domain/          # Entities, Enums — zero dependencies
├── PersonalLifeOS.Application/     # DTOs — depends on Domain
├── PersonalLifeOS.Infrastructure/  # EF Core, Repositories, Services, Identity, FileStorage — depends on Application
├── PersonalLifeOS.API/             # ASP.NET Core Web API, Controllers — depends on Application + Infrastructure
└── frontend/                       # React 19 + TypeScript SPA (Vite)
```

**Dependency flow:** `API → Infrastructure → Application → Domain`

---

## 3. Backend — .NET API

### 3.1 Project References & Packages

#### PersonalLifeOS.Domain.csproj
- **Target:** `net10.0`
- **Nullable:** enabled
- **ImplicitUsings:** enabled
- **Packages:** none
- **References:** none

#### PersonalLifeOS.Application.csproj
- **Target:** `net10.0`
- **Nullable:** enabled
- **ImplicitUsings:** enabled
- **Packages:** none
- **References:** `PersonalLifeOS.Domain`

#### PersonalLifeOS.Infrastructure.csproj
- **Target:** `net10.0`
- **Nullable:** enabled
- **ImplicitUsings:** enabled
- **Packages:**
  - `Microsoft.AspNetCore.Http.Features` 5.0.17
  - `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 10.0.3
  - `Microsoft.EntityFrameworkCore.SqlServer` 10.0.3
  - `Microsoft.EntityFrameworkCore.Tools` 10.0.3
- **References:** `PersonalLifeOS.Application`

#### PersonalLifeOS.API.csproj
- **Target:** `net10.0`
- **Nullable:** enabled
- **ImplicitUsings:** enabled
- **Packages:**
  - `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.3
  - `Microsoft.EntityFrameworkCore.Design` 10.0.3
  - `Swashbuckle.AspNetCore` 6.8.1
- **References:** `PersonalLifeOS.Application`, `PersonalLifeOS.Infrastructure`

---

### 3.2 Domain Entities

All entities share these audit fields:
```
CreatedBy   : string
CreatedDate : DateTime
UpdatedBy   : string?
UpdatedDate : DateTime?
```

#### TaskEntity (`PersonalLifeOS.Domain/Entities/TaskEntity.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Title | string | `""` | Required, max 200 |
| Description | string? | null | Max 1000 |
| DueDate | DateTime? | null | Optional |
| Category | string? | null | Max 50 |
| Priority | string? | null | High / Medium / Low |
| StatusCode | string | `GeneralStatuses.PENDING` | PENDING / COMPLETED / DELETED |
| UserId | string | `""` | Required, max 450 |

#### Bill (`PersonalLifeOS.Domain/Entities/Bill.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Name | string | `""` | Required, max 200 |
| Amount | decimal | — | decimal(18,2) |
| DueDate | DateTime | — | Required |
| ReminderDaysBefore | int | 3 | Days before due date to remind |
| StatusCode | string | `GeneralStatuses.PENDING` | PENDING / Paid / DELETED |
| UserId | string | `""` | Required, max 450 |

#### DailyJournal (`PersonalLifeOS.Domain/Entities/DailyJournal.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Date | DateTime | — | Required |
| Notes | string | `""` | Required |
| StatusCode | string | `GeneralStatuses.ACTIVE` | ACTIVE / DELETED |
| UserId | string | `""` | Required, max 450 |

#### Receipt (`PersonalLifeOS.Domain/Entities/Receipt.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Title | string | `""` | Required, max 200 |
| ImagePath | string | `""` | Required, max 500 (GUID-prefixed filename) |
| Amount | decimal | — | decimal(18,2) |
| Date | DateTime | — | Required |
| Category | string? | null | Max 50 |
| StatusCode | string | `GeneralStatuses.ACTIVE` | ACTIVE / DELETED |
| UserId | string | `""` | Required, max 450 |

#### Transaction (`PersonalLifeOS.Domain/Entities/Transaction.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Amount | decimal | — | decimal(18,2) |
| Type | TransactionType | — | Income / Expense enum |
| Category | string? | null | Max 50 |
| Date | DateTime | — | Required |
| Notes | string? | null | Max 500 |
| StatusCode | string | `GeneralStatuses.ACTIVE` | ACTIVE / DELETED |
| UserId | string | `""` | Required, max 450 |

#### MonthlyPayment (`PersonalLifeOS.Domain/Entities/MonthlyPayment.cs`)
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| Id | int | — | Primary key |
| Title | string | `""` | Required, max 200 |
| Amount | decimal | — | decimal(18,2) |
| Month | int | — | 1–12 |
| Year | int | — | e.g. 2026 |
| StatusCode | string | `GeneralStatuses.PENDING` | PENDING / COMPLETED / DELETED |
| UserId | string | `""` | Required, max 450 |
| Notes | string? | null | Max 500 |

---

### 3.3 Enums & Constants

#### GeneralStatuses (`PersonalLifeOS.Domain/Enums/GeneralStatuses.cs`)
```csharp
public record GeneralStatuses
{
    public const string PENDING   = "PENDING";
    public const string COMPLETED = "COMPLETED";
    public const string CANCLED   = "CANCLED";     // intentional spelling
    public const string DELETED   = "DELETED";
    public const string ACTIVE    = "ACTIVE";
}
```
Used throughout all entities and services instead of hardcoded strings.

#### TransactionType (`PersonalLifeOS.Domain/Enums/TransactionType.cs`)
```csharp
public enum TransactionType
{
    Income,
    Expense
}
```

---

### 3.4 DTOs (Data Transfer Objects)

All DTOs are in `PersonalLifeOS.Application/DTOs/`.

#### ApiResponse\<T\> (`ApiResponse.cs`)
Generic wrapper for all API responses:
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T? Data { get; set; }
    public List<string> Errors { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
    public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null)
}
```

#### AuthResponseDto (`AuthResponseDto.cs`)
| Property | Type |
|----------|------|
| Token | string |
| Email | string |
| FullName | string |
| ExpiresAt | DateTime |

#### LoginDto (`LoginDto.cs`)
| Property | Type | Validation |
|----------|------|------------|
| Email | string | `[Required]` `[EmailAddress]` |
| Password | string | `[Required]` |

#### RegisterDto (`RegisterDto.cs`)
| Property | Type | Validation |
|----------|------|------------|
| Email | string | `[Required]` `[EmailAddress]` |
| Password | string | `[Required]` `[MinLength(6)]` |
| ConfirmPassword | string | `[Required]` `[Compare("Password")]` |
| FullName | string | `[Required]` `[MaxLength(100)]` |

#### TaskDto / CreateTaskDto / UpdateTaskDto (`TaskDto.cs`)

**TaskDto (Response):**
| Property | Type |
|----------|------|
| Id | int |
| Title | string |
| Description | string? |
| DueDate | DateTime? |
| Category | string? |
| Priority | string? |
| StatusCode | string |
| CreatedDate | DateTime |

**CreateTaskDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Title | string | `[Required]` `[MaxLength(200)]` |
| Description | string? | `[MaxLength(1000)]` |
| DueDate | DateTime? | — |
| Category | string? | `[MaxLength(50)]` |
| Priority | string? | `[MaxLength(20)]` |

**UpdateTaskDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Id | int | — |
| Title | string | `[Required]` `[MaxLength(200)]` |
| Description | string? | `[MaxLength(1000)]` |
| DueDate | DateTime? | — |
| Category | string? | `[MaxLength(50)]` |
| Priority | string? | `[MaxLength(20)]` |
| StatusCode | string | `[Required]` default `GeneralStatuses.PENDING` |

#### BillDto / CreateBillDto / UpdateBillDto (`BillDto.cs`)

**BillDto (Response):**
| Property | Type |
|----------|------|
| Id | int |
| Name | string |
| Amount | decimal |
| DueDate | DateTime |
| Category | string? |
| StatusCode | string |
| ReminderDaysBefore | int |

**CreateBillDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Name | string | `[Required]` `[MaxLength(200)]` |
| Amount | decimal | `[Required]` |
| DueDate | DateTime | `[Required]` |
| ReminderDaysBefore | int | default 3 |

**UpdateBillDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Id | int | — |
| Name | string | `[Required]` `[MaxLength(200)]` |
| Amount | decimal | `[Required]` |
| DueDate | DateTime | `[Required]` |
| ReminderDaysBefore | int | default 3 |
| StatusCode | string | `[Required]` default `GeneralStatuses.PENDING` |

#### JournalDto / CreateJournalDto / UpdateJournalDto (`JournalDto.cs`)

**JournalDto (Response):**
| Property | Type |
|----------|------|
| Id | int |
| Date | DateTime |
| Notes | string |
| StatusCode | string |
| CreatedDate | DateTime |

**CreateJournalDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Date | DateTime | `[Required]` default `DateTime.Today` |
| Notes | string | `[Required]` |

**UpdateJournalDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Id | int | — |
| Date | DateTime | `[Required]` |
| Notes | string | `[Required]` |

#### ReceiptDto / CreateReceiptDto / UpdateReceiptDto (`ReceiptDto.cs`)

**ReceiptDto (Response):**
| Property | Type |
|----------|------|
| Id | int |
| Title | string |
| Amount | decimal |
| Date | DateTime |
| Category | string? |
| ImagePath | string |
| StatusCode | string |
| CreatedDate | DateTime |

**CreateReceiptDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Title | string | `[Required]` `[MaxLength(200)]` |
| Amount | decimal | `[Required]` |
| Date | DateTime | `[Required]` default `DateTime.Today` |
| Category | string? | `[MaxLength(50)]` |

**UpdateReceiptDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Id | int | — |
| Title | string | `[Required]` `[MaxLength(200)]` |
| Amount | decimal | `[Required]` |
| Date | DateTime | `[Required]` |
| Category | string? | `[MaxLength(50)]` |

#### TransactionDto / CreateTransactionDto / UpdateTransactionDto (`TransactionDto.cs`)

**TransactionDto (Response):**
| Property | Type |
|----------|------|
| Id | int |
| Amount | decimal |
| Type | TransactionType |
| Category | string? |
| Date | DateTime |
| Notes | string? |
| StatusCode | string |

**CreateTransactionDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Amount | decimal | `[Required]` |
| Type | TransactionType | `[Required]` |
| Category | string? | `[MaxLength(50)]` |
| Date | DateTime | `[Required]` default `DateTime.Today` |
| Notes | string? | `[MaxLength(500)]` |

**UpdateTransactionDto (Request):**
| Property | Type | Validation |
|----------|------|------------|
| Id | int | — |
| Amount | decimal | `[Required]` |
| Type | TransactionType | `[Required]` |
| Category | string? | `[MaxLength(50)]` |
| Date | DateTime | `[Required]` |
| Notes | string? | `[MaxLength(500)]` |

#### DashboardDto (`DashboardDto.cs`)
| Property | Type |
|----------|------|
| TotalTasks | int |
| CompletedTasks | int |
| PendingTasks | int |
| OverdueTasks | int |
| TotalJournalEntries | int |
| TotalReceipts | int |
| TotalBills | int |
| UnpaidBills | int |
| TotalExpenses | decimal |
| TotalIncome | decimal |
| NetBalance | decimal |
| RecentTasks | List\<TaskDto\>? |
| UpcomingBills | List\<BillDto\>? |

---

### 3.5 Repositories

All repositories are concrete classes in `PersonalLifeOS.Infrastructure/Repositories/`. No interfaces — registered directly in DI.

**Common Pattern:**
- All queries filter `StatusCode != GeneralStatuses.DELETED` (soft deletes)
- All queries filter by `UserId` (user scoping)
- `AddAsync()` sets `CreatedDate = DateTime.Now`
- `UpdateAsync()` sets `UpdatedDate = DateTime.Now`
- `DeleteAsync()` soft-deletes: sets `StatusCode = DELETED`, `UpdatedDate`, `UpdatedBy`

#### TaskRepository
| Method | Description |
|--------|-------------|
| `GetAllByUserIdAsync(userId)` | All non-deleted tasks, ordered by `CreatedDate` desc |
| `GetByIdAsync(id)` | Single task, non-deleted only |
| `AddAsync(task)` | Insert + set `CreatedDate` |
| `UpdateAsync(task)` | Update + set `UpdatedDate` |
| `DeleteAsync(id, userId)` | Soft delete |

#### BillRepository
| Method | Description |
|--------|-------------|
| `GetAllByUserIdAsync(userId)` | All non-deleted bills, ordered by `DueDate` |
| `GetByIdAsync(id)` | Single bill, non-deleted only |
| `GetUpcomingBillsAsync(userId)` | PENDING bills where `DueDate >= today`, ordered by `DueDate`, take 5 |
| `AddAsync(bill)` | Insert |
| `UpdateAsync(bill)` | Update |
| `DeleteAsync(id, userId)` | Soft delete |

#### JournalRepository
| Method | Description |
|--------|-------------|
| `GetAllByUserIdAsync(userId)` | All non-deleted journals, ordered by `Date` desc |
| `GetByIdAsync(id)` | Single entry |
| `GetByDateAsync(userId, date)` | Entry for specific date, non-deleted |
| `GetByDateIncludeDeletedAsync(userId, date)` | Entry for specific date, includes deleted |
| `AddAsync(journal)` | Insert |
| `UpdateAsync(journal)` | Update |
| `DeleteAsync(id, userId)` | Soft delete |

#### ReceiptRepository
| Method | Description |
|--------|-------------|
| `GetAllByUserIdAsync(userId)` | All non-deleted receipts, ordered by `Date` desc |
| `GetByIdAsync(id)` | Single receipt |
| `AddAsync(receipt)` | Insert |
| `UpdateAsync(receipt)` | Update |
| `DeleteAsync(id, userId)` | Soft delete |

#### TransactionRepository
| Method | Description |
|--------|-------------|
| `GetAllByUserIdAsync(userId)` | All non-deleted, ordered by `Date` desc |
| `GetByIdAsync(id)` | Single transaction |
| `GetMonthlyExpenseAsync(userId, year, month)` | Sum of Expense-type transactions for month, non-deleted |
| `AddAsync(transaction)` | Insert |
| `UpdateAsync(transaction)` | Update |
| `DeleteAsync(id, userId)` | Soft delete |

---

### 3.6 Services

All services are in `PersonalLifeOS.Infrastructure/Services/`. Each injects its corresponding repository.

#### TaskService
| Method | Logic |
|--------|-------|
| `GetAllTasksAsync(userId)` | Delegates to repo |
| `GetTaskByIdAsync(id)` | Delegates to repo |
| `CreateTaskAsync(dto, userId)` | Maps DTO → entity, sets `StatusCode = PENDING`, `Priority` from dto, audit fields |
| `UpdateTaskAsync(dto, userId)` | Fetches existing, maps all fields including `Priority`, sets audit fields |
| `CompleteTaskAsync(id, userId)` | Sets `StatusCode = COMPLETED`, updates audit |
| `DeleteTaskAsync(id, userId)` | Delegates soft delete to repo |

#### BillService
| Method | Logic |
|--------|-------|
| `GetAllBillsAsync(userId)` | Delegates to repo |
| `GetUpcomingBillsAsync(userId)` | Delegates to repo |
| `GetBillByIdAsync(id)` | Delegates to repo |
| `CreateBillAsync(dto, userId)` | Maps DTO → entity, `StatusCode = PENDING` |
| `UpdateBillAsync(dto, userId)` | Maps all fields |
| `MarkBillAsPaidAsync(id, userId)` | Sets `StatusCode = "Paid"` |
| `DeleteBillAsync(id, userId)` | Soft delete |

#### JournalService
| Method | Logic |
|--------|-------|
| `GetAllJournalsAsync(userId)` | Delegates to repo |
| `GetJournalByIdAsync(id)` | Delegates to repo |
| `CreateJournalAsync(dto, userId)` | `StatusCode = ACTIVE`, date normalized to `.Date` |
| `UpdateJournalAsync(dto, userId)` | Maps fields, normalizes date |
| `DeleteJournalAsync(id, userId)` | Soft delete |

#### ReceiptService
| Method | Logic |
|--------|-------|
| `GetAllReceiptsAsync(userId)` | Delegates to repo |
| `GetReceiptByIdAsync(id)` | Delegates to repo |
| `CreateReceiptAsync(dto, imageFile, userId)` | Saves image via `FileStorageService`, stores filename in `ImagePath`, `StatusCode = ACTIVE` |
| `UpdateReceiptAsync(dto, userId)` | Updates metadata only (no image change) |
| `UpdateReceiptImageAsync(id, imageFile, userId)` | Deletes old image file, saves new, updates `ImagePath` |
| `DeleteReceiptAsync(id, userId)` | Deletes physical image file, then soft-deletes entity |

#### TransactionService
| Method | Logic |
|--------|-------|
| `GetAllTransactionsAsync(userId)` | Delegates to repo |
| `GetTransactionByIdAsync(id)` | Delegates to repo |
| `GetMonthlyExpenseAsync(userId, year, month)` | Delegates to repo |
| `CreateTransactionAsync(dto, userId)` | `StatusCode = ACTIVE` |
| `UpdateTransactionAsync(dto, userId)` | Maps all fields |
| `DeleteTransactionAsync(id, userId)` | Soft delete |

---

### 3.7 Controllers & API Endpoints

All controllers extend `BaseApiController` which provides `GetCurrentUserId()` (extracts from JWT `ClaimTypes.NameIdentifier`).

All endpoints (except Auth) require `[Authorize]`.  
All responses are wrapped in `ApiResponse<T>`.

#### AuthController (`/api/auth`)
| Method | Route | Auth | Input | Output |
|--------|-------|------|-------|--------|
| POST | `/api/auth/register` | No | `RegisterDto` | `ApiResponse<AuthResponseDto>` |
| POST | `/api/auth/login` | No | `LoginDto` | `ApiResponse<AuthResponseDto>` |

- Register: checks for existing user, creates via `UserManager`, returns JWT
- Login: validates credentials via `UserManager`, returns JWT
- JWT Claims: `Sub`, `NameIdentifier`, `Email`, `Jti`, `FullName`
- Token expiry: configurable (default 60 minutes)

#### TasksController (`/api/tasks`)
| Method | Route | Input | Output |
|--------|-------|-------|--------|
| GET | `/api/tasks` | — | `ApiResponse<List<TaskDto>>` |
| GET | `/api/tasks/{id}` | — | `ApiResponse<TaskDto>` |
| POST | `/api/tasks` | `CreateTaskDto` | `ApiResponse<TaskDto>` |
| PUT | `/api/tasks/{id}` | `UpdateTaskDto` | `ApiResponse<TaskDto>` |
| DELETE | `/api/tasks/{id}` | — | `ApiResponse<bool>` |
| POST | `/api/tasks/{id}/complete` | — | `ApiResponse<bool>` |

#### BillsController (`/api/bills`)
| Method | Route | Input | Output |
|--------|-------|-------|--------|
| GET | `/api/bills` | — | `ApiResponse<List<BillDto>>` |
| GET | `/api/bills/{id}` | — | `ApiResponse<BillDto>` |
| POST | `/api/bills` | `CreateBillDto` | `ApiResponse<BillDto>` |
| PUT | `/api/bills/{id}` | `UpdateBillDto` | `ApiResponse<BillDto>` |
| POST | `/api/bills/{id}/pay` | — | `ApiResponse<bool>` |
| DELETE | `/api/bills/{id}` | — | `ApiResponse<bool>` |

#### JournalController (`/api/journal`)
| Method | Route | Input | Output |
|--------|-------|-------|--------|
| GET | `/api/journal` | — | `ApiResponse<List<JournalDto>>` |
| GET | `/api/journal/{id}` | — | `ApiResponse<JournalDto>` |
| POST | `/api/journal` | `CreateJournalDto` | `ApiResponse<JournalDto>` |
| PUT | `/api/journal/{id}` | `UpdateJournalDto` | `ApiResponse<JournalDto>` |
| DELETE | `/api/journal/{id}` | — | `ApiResponse<bool>` |

#### ReceiptsController (`/api/receipts`)
| Method | Route | Input | Content-Type | Output |
|--------|-------|-------|--------------|--------|
| GET | `/api/receipts` | — | — | `ApiResponse<List<ReceiptDto>>` |
| GET | `/api/receipts/{id}` | — | — | `ApiResponse<ReceiptDto>` |
| POST | `/api/receipts` | `CreateReceiptDto` + `IFormFile` | `multipart/form-data` | `ApiResponse<ReceiptDto>` |
| PUT | `/api/receipts/{id}` | `UpdateReceiptDto` | `application/json` | `ApiResponse<ReceiptDto>` |
| PUT | `/api/receipts/{id}/image` | `IFormFile` | `multipart/form-data` | `ApiResponse<ReceiptDto>` |
| DELETE | `/api/receipts/{id}` | — | — | `ApiResponse<bool>` |

#### TransactionsController (`/api/transactions`)
| Method | Route | Input | Output |
|--------|-------|-------|--------|
| GET | `/api/transactions` | — | `ApiResponse<List<TransactionDto>>` |
| GET | `/api/transactions/{id}` | — | `ApiResponse<TransactionDto>` |
| POST | `/api/transactions` | `CreateTransactionDto` | `ApiResponse<TransactionDto>` |
| PUT | `/api/transactions/{id}` | `UpdateTransactionDto` | `ApiResponse<TransactionDto>` |
| DELETE | `/api/transactions/{id}` | — | `ApiResponse<bool>` |

#### DashboardController (`/api/dashboard`)
| Method | Route | Output |
|--------|-------|--------|
| GET | `/api/dashboard` | `ApiResponse<DashboardDto>` |

Returns: task counts (total, completed, pending, overdue), journal/receipt/bill counts, financial summary (income, expenses, balance), 5 most recent tasks, 5 soonest upcoming bills. All queries run sequentially to avoid `DbContext` concurrency issues.

---

### 3.8 Identity & Authentication

#### ApplicationUser (`PersonalLifeOS.Infrastructure/Identity/ApplicationUser.cs`)
Extends `IdentityUser`:
| Property | Type | Default |
|----------|------|---------|
| FullName | string? | null |
| PreferredLanguage | string? | null |
| StatusCode | string | `GeneralStatuses.ACTIVE` |
| + Audit fields | | |

#### JWT Configuration
- **Issuer:** `PersonalLifeOSAPI`
- **Audience:** `PersonalLifeOSClient`
- **Secret Key:** `YourSuperSecretKeyForDevelopment12345678901234567890`
- **Expiry:** 60 minutes
- **Validation:** Issuer ✓, Audience ✓, Lifetime ✓, SigningKey ✓, ClockSkew: 0

#### Identity Password Policy
- RequireDigit: `true`
- RequiredLength: `6`
- RequireNonAlphanumeric: `false`
- RequireUppercase: `false`
- RequireLowercase: `false`

---

### 3.9 Database & Persistence

#### ApplicationDbContext (`PersonalLifeOS.Infrastructure/Persistence/ApplicationDbContext.cs`)
Extends `IdentityDbContext<ApplicationUser>`.

**DbSets:**
| DbSet | Entity |
|-------|--------|
| Tasks | TaskEntity |
| DailyJournals | DailyJournal |
| Receipts | Receipt |
| Bills | Bill |
| Transactions | Transaction |
| MonthlyPayments | MonthlyPayment |

#### EF Core Indexes

| Entity | Index Columns |
|--------|---------------|
| TaskEntity | `(UserId, StatusCode)`, `(DueDate)` |
| DailyJournal | `(UserId, Date)` |
| Receipt | `(UserId, Date)` |
| Bill | `(UserId, DueDate, StatusCode)` |
| Transaction | `(UserId, Date, Type)` |
| MonthlyPayment | `(UserId, Year, Month)` |

#### Decimal Precision
All `Amount` fields configured as `decimal(18,2)`.

#### Connection String
```
Data Source=(localdb)\MSSQLLocalDB;Database=PersonalLifeOSDb;
Integrated Security=True;Persist Security Info=False;Pooling=False;
MultipleActiveResultSets=True;Encrypt=True;TrustServerCertificate=True
```

#### Migrations (Applied)
1. `20260305004453_InitialCreate`
2. `20260306012001_FixJournalUniqueIndexFilter`
3. `20260306023023_AllowMultipleJournalEntriesPerDay`
4. `20260306043847_AddTaskPriority`

---

### 3.10 File Storage

#### FileStorageService (`PersonalLifeOS.Infrastructure/FileStorage/FileStorageService.cs`)
| Method | Description |
|--------|-------------|
| `SaveFileAsync(stream, fileName)` | Saves with GUID prefix (`{Guid}_{originalName}`), returns filename only |
| `DeleteFile(fileName)` | Deletes from upload directory |
| `GetFilePath(fileName)` | Returns full filesystem path |

- **Upload path:** `wwwroot/uploads/receipts/`
- **Static file serving:** Files served via ASP.NET Core static files middleware
- **Registered as:** Singleton in DI

---

### 3.11 Configuration

#### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=(localdb)\\MSSQLLocalDB;Database=PersonalLifeOSDb;..."
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForDevelopment12345678901234567890",
    "Issuer": "PersonalLifeOSAPI",
    "Audience": "PersonalLifeOSClient",
    "ExpiryInMinutes": 60
  },
  "AllowedHosts": "*"
}
```

#### launchSettings.json
- **http profile:** `http://localhost:5207`
- **https profile:** `https://localhost:7071` + `http://localhost:5207`
- No browser auto-launch
- Environment: `Development`

---

### 3.12 Middleware Pipeline

**Order (in `Program.cs`):**
1. Swagger UI (Development only — redirects root `/` to Swagger)
2. HTTPS Redirection
3. Static Files (serves `wwwroot/`)
4. CORS (`AllowReactApp` policy)
5. Authentication
6. Authorization
7. Map Controllers

**CORS Allowed Origins:**
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`
- `http://localhost:5176`
- `http://localhost:3000`

**DI Registrations (Scoped):**
- 5 Repositories: `TaskRepository`, `JournalRepository`, `ReceiptRepository`, `BillRepository`, `TransactionRepository`
- 5 Services: `TaskService`, `JournalService`, `ReceiptService`, `BillService`, `TransactionService`
- `FileStorageService` (Singleton)

**JSON Serialization:**
- `JsonStringEnumConverter` registered for enum serialization (e.g., `TransactionType`)

---

## 4. Frontend — React SPA

### 4.1 Tech Stack & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI framework |
| React DOM | 19.2.0 | DOM rendering |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool + dev server |
| React Router DOM | 7.13.1 | Client-side routing |
| TanStack React Query | 5.90.21 | Server state management |
| Zustand | 5.0.11 | Client state management |
| Axios | 1.13.6 | HTTP client |
| i18next | 25.8.14 | Internationalization framework |
| react-i18next | 16.5.4 | React i18n bindings |
| i18next-browser-languagedetector | 8.2.1 | Auto language detection |
| react-datepicker | 9.1.0 | Date picker component |
| Tailwind CSS | 4.2.1 | Utility-first CSS |
| @tailwindcss/postcss | 4.2.1 | PostCSS integration |
| autoprefixer | 10.4.27 | CSS vendor prefixing |
| ESLint | 9.39.1 | Linting |
| typescript-eslint | 8.48.0 | TS linting rules |
| eslint-plugin-react-hooks | 7.0.1 | React hooks lint rules |
| eslint-plugin-react-refresh | 0.4.24 | Fast refresh lint rules |

---

### 4.2 Build & Config Files

#### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

#### TypeScript Config
- **Target:** ES2022 (app), ES2023 (node)
- **Module:** ESNext with bundler resolution
- **Strict mode:** enabled
- **JSX:** react-jsx
- **Additional:** `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

#### postcss.config.js
```javascript
export default { plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} } }
```

#### index.html
- Charset: UTF-8
- Viewport: responsive
- Google Fonts: Tajawal (weights: 300, 400, 500, 700, 800)
- Title: "Personal Life OS"

---

### 4.3 Entry Point & Routing

#### main.tsx
```
StrictMode → createRoot → App
```
Imports: `i18n/index`, `index.css`, `App`

#### App.tsx

**Provider hierarchy:**
```
QueryClientProvider → BrowserRouter → ToastProvider → AppRoutes
```

**Route table:**

| Path | Component | Protected |
|------|-----------|-----------|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/tasks` | TasksPage | Yes |
| `/bills` | BillsPage | Yes |
| `/journal` | JournalPage | Yes |
| `/receipts` | ReceiptsPage | Yes |
| `/transactions` | TransactionsPage | Yes |
| `/profile` | ProfilePage | Yes |
| `/` | → redirect to `/dashboard` | — |
| `*` | → redirect to `/dashboard` | — |

**Initialization:** On mount, calls `useAuthStore.initialize()` and `useThemeStore.initializeTheme()`.

---

### 4.4 Pages

#### LoginPage
- Email + password form
- Error message display
- Language toggle button
- Link to register page
- On success: saves user to auth store + localStorage, navigates to `/dashboard`

#### RegisterPage
- Email + password + confirm password + full name form
- Client-side password match validation
- Error handling
- Link to login page

#### DashboardPage
- Time-of-day greeting (morning/afternoon/evening)
- Today's date in locale format
- **Stats grid (4 cards):** Total Tasks, Completed, Pending, Overdue
- **Financial stats (3 cards):** Total Income (green), Total Expenses (red), Net Balance (color-coded)
- **Recent Tasks section:** Grid of task cards showing title, category badge, priority badge, status
- **Upcoming Bills section:** Grid of bill cards showing name, amount (EGP), due date

#### TasksPage
- **Form:** Title (required), Description (textarea), Due Date (AppDatePicker), Category (AppSelect dropdown), Priority (AppSelect — High/Medium/Low/None)
- **Filters:**
  - Status toggle buttons: All / Pending / Completed
  - Priority filter buttons: All / High (red) / Medium (yellow) / Low (green) / None
  - Search input (by title/category)
  - Date range: From + To (AppDatePicker) with Clear button
- **Task list:** Cards with checkbox (complete), title, description, category badge, priority badge (color-coded), due date, edit/delete buttons
- **Priority badge colors:** High → `--danger`/`--danger-bg`, Medium → `--warning`/`--warning-bg`, Low → `--success`/`--success-bg`
- **Completed tasks:** Line-through title, muted text
- **Empty state:** Shows different messages for no-results vs no-tasks

#### BillsPage
- **Form:** Name (required), Amount (required), Due Date (AppDatePicker, required), Reminder Days Before (number input, default 3)
- **Filters:**
  - Search input (by name/category)
  - Status filter: All / Pending / Paid
  - Date range with Clear button
- **Bill list:** Cards with status indicator (colored dot), name, amount (EGP), due date, reminder badge, "Mark Paid" button, edit/delete buttons
- **Status colors:** Pending=warning, Paid=success, Overdue=danger
- **Header:** Shows pending and paid counts

#### TransactionsPage
- **Form:** Amount (required), Type toggle (Income/Expense), Category (dynamic options based on type), Date (required), Notes
- **Income categories:** Salary, Freelance, Business, Investment, Gift, Other
- **Expense categories:** Food & Dining, Transport, Entertainment, Utilities, Shopping, Education, Health, Rent, Other
- **Filters:**
  - Search input (by category/notes)
  - Type filter tabs: All / Income / Expense
  - Date range with Clear button
- **Summary cards:** Total Income (+), Total Expenses (−), Balance
- **Transaction list:** Cards with type indicator (green +/red −), amount (EGP), category, date, notes
- **Empty state:** Filter-aware messaging

#### ReceiptsPage
- **Form:** Title (required), Amount (required), Date (AppDatePicker, required), Category (AppSelect), Image upload (required on create)
- **Image handling:**
  - Drag-and-drop style file input
  - Preview on hover with "Change Image" overlay
  - Separate endpoint for image update (`PUT /receipts/{id}/image`)
- **Filters:**
  - Search input (by title/category)
  - Date range with Clear button
- **Grid layout:** 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- **Receipt cards:** Image header, title, amount (EGP), date, category badge, edit/delete buttons
- **Header count:** Shows filtered count + total amount

#### JournalPage
- **Form:** Date (AppDatePicker, required), Notes (8-row textarea, required)
- **Filters:**
  - Search input (by notes content)
  - Date range with Clear button
- **Entry list:** Cards with formatted date (locale-aware: weekday + full date), notes, edit/delete buttons
- **Sorted:** Newest first
- **Empty state:** Filter-aware messaging

#### ProfilePage
- **User info:** Avatar with initials, full name, email
- **Preferences:**
  - Dark mode toggle (switch with sun/moon icon)
  - Language toggle button (English ↔ العربية)
- **Stats grid (4 cards):** Total Tasks, Completed Tasks, Journal Entries, Receipts

---

### 4.5 Layout Components

#### MainLayout (`src/components/layout/MainLayout.tsx`)
Wraps all protected pages. Contains:

**Desktop Sidebar:**
- Collapsible: 224px expanded / 60px collapsed (animated width transition)
- Logo + "Personal Life OS" text (hidden when collapsed)
- Navigation items with SVG icons:
  - Dashboard, Tasks, Bills, Transactions, Receipts, Journal, Profile
- Active route highlighting with accent color
- Bottom section: Language toggle, Dark mode toggle, User avatar + name, Logout button
- Collapse toggle: Chevron button that rotates on collapse

**Mobile Top Bar:**
- Hamburger menu button
- Logo + app name
- Dark mode toggle

**Mobile Sidebar:**
- Overlay backdrop (click to close)
- Slide-in panel (RTL-aware: slides from left in LTR, right in RTL)
- Same navigation items as desktop
- Same bottom section

**Main Content:**
- `max-w-5xl` container with padding
- Footer with copyright text

#### ProtectedRoute (`src/components/layout/ProtectedRoute.tsx`)
- If `!isInitialized` → shows `PageLoader`
- If `!isAuthenticated` → `<Navigate to="/login" />`
- Otherwise → renders children

---

### 4.6 UI Components

#### Spinner (`src/components/ui/Spinner.tsx`)
- **Spinner:** Animated border spinner with sizes: `sm` (16px), `md` (32px), `lg` (48px)
- **PageLoader:** Centered spinner + optional message text

#### Toast (`src/components/ui/Toast.tsx`)
- **ToastProvider:** React Context wrapping the app
- **useToast():** Hook returning `showToast(message, type)`
- **ToastItem:** Individual notification with auto-dismiss
  - Types: `success` (✓ green), `error` (✕ red), `info` (i blue)
  - Animation: Slide in → auto-hide at 2.8s → remove at 3.3s
  - Position: Fixed bottom-right (`insetInlineEnd` for RTL)

#### AppDatePicker (`src/components/ui/AppDatePicker.tsx`)
- Wraps `react-datepicker`
- Props: `value` (ISO string), `onChange`, `placeholder`, `required`, `minDate`
- Calendar icon overlay
- Custom input with focus/blur border styling
- Date format: `MMM d, yyyy`
- Popper placement: `bottom-start`

#### AppSelect (`src/components/ui/AppSelect.tsx`)
- Custom accessible dropdown (not native `<select>`)
- Props: `value`, `onChange`, `options[]` (value + label), `placeholder`
- **Keyboard:** ArrowUp/Down (navigate), Enter (select), Escape (close)
- Checkmark on selected option
- Outside-click closes dropdown
- Auto-highlights current selection on open

#### ConfirmDialog (`src/components/ui/ConfirmDialog.tsx`)
- Modal overlay with dialog box
- Props: `open`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant` (danger/warning), `loading`, `onConfirm`, `onCancel`
- Escape key closes
- Auto-focus cancel button on open
- Loading state shows "…" on confirm button
- Accessible: `role="alertdialog"`, `aria-modal`, `aria-label`

#### DarkModeToggle (`src/components/ui/DarkModeToggle.tsx`)
- Toggle button with sun ☀ / moon 🌙 SVG icons
- Uses `useThemeStore.toggleTheme()`

---

### 4.7 State Management (Zustand Stores)

#### authStore (`src/stores/authStore.ts`)
| State | Type | Purpose |
|-------|------|---------|
| user | `User \| null` | Current authenticated user |
| isAuthenticated | boolean | Auth status flag |
| isInitialized | boolean | Whether store has loaded from localStorage |

| Action | Description |
|--------|-------------|
| `setUser(user)` | Sets user + isAuthenticated + isInitialized |
| `logout()` | Clears state, removes `token` and `user` from localStorage |
| `initialize()` | Reads `token` + `user` from localStorage on app boot |

#### themeStore (`src/stores/themeStore.ts`)
| State | Type | Purpose |
|-------|------|---------|
| isDarkMode | boolean | Current theme |

| Action | Description |
|--------|-------------|
| `toggleTheme()` | Toggles dark mode, persists to localStorage(`theme`), toggles `dark` class on `<html>` |
| `initializeTheme()` | Reads from localStorage, falls back to `prefers-color-scheme`, applies |

#### sidebarStore (`src/stores/sidebarStore.ts`)
| State | Type | Purpose |
|-------|------|---------|
| collapsed | boolean | Sidebar collapse state (default from localStorage) |

| Action | Description |
|--------|-------------|
| `toggle()` | Toggles collapsed, persists to localStorage(`sidebar-collapsed`) |

---

### 4.8 API Services

#### api.ts (Base Axios Instance)
- **Base URL:** `http://localhost:5207/api`
- **Request interceptor:** Adds `Authorization: Bearer {token}` from localStorage; sets `Content-Type: application/json` except for `FormData`
- **Response interceptor:** On 401, clears localStorage tokens & redirects to `/login`
- **Exports:** `API_BASE_URL` = `http://localhost:5207` (used for image URLs)

#### auth.service.ts
| Method | Endpoint | Notes |
|--------|----------|-------|
| `register(data)` | POST `/auth/register` | Saves token + user to localStorage |
| `login(data)` | POST `/auth/login` | Saves token + user to localStorage |
| `logout()` | — | Clears localStorage |
| `isAuthenticated()` | — | Checks localStorage for token |
| `getCurrentUser()` | — | Parses user from localStorage |

#### dashboard.service.ts
| Method | Endpoint |
|--------|----------|
| `getDashboard()` | GET `/dashboard` |

#### task.service.ts
| Method | Endpoint | Notes |
|--------|----------|-------|
| `getAllTasks()` | GET `/tasks` | |
| `getTaskById(id)` | GET `/tasks/{id}` | |
| `createTask(data)` | POST `/tasks` | Converts empty dueDate to null |
| `updateTask(data)` | PUT `/tasks/{id}` | |
| `deleteTask(id)` | DELETE `/tasks/{id}` | |
| `completeTask(id)` | POST `/tasks/{id}/complete` | |

#### bill.service.ts
| Method | Endpoint |
|--------|----------|
| `getAllBills()` | GET `/bills` |
| `createBill(data)` | POST `/bills` |
| `updateBill(id, data)` | PUT `/bills/{id}` |
| `markAsPaid(id)` | POST `/bills/{id}/pay` |
| `deleteBill(id)` | DELETE `/bills/{id}` |

#### journal.service.ts
| Method | Endpoint |
|--------|----------|
| `getAllJournals()` | GET `/journal` |
| `createJournal(data)` | POST `/journal` |
| `updateJournal(id, data)` | PUT `/journal/{id}` |
| `deleteJournal(id)` | DELETE `/journal/{id}` |

#### receipt.service.ts
| Method | Endpoint | Notes |
|--------|----------|-------|
| `getAllReceipts()` | GET `/receipts` | |
| `createReceipt(data, imageFile)` | POST `/receipts` | Sends as FormData |
| `updateReceipt(id, data)` | PUT `/receipts/{id}` | JSON only (no image) |
| `updateReceiptImage(id, imageFile)` | PUT `/receipts/{id}/image` | FormData with imageFile |
| `deleteReceipt(id)` | DELETE `/receipts/{id}` | |

#### transaction.service.ts
| Method | Endpoint |
|--------|----------|
| `getAllTransactions()` | GET `/transactions` |
| `createTransaction(req)` | POST `/transactions` |
| `updateTransaction(id, req)` | PUT `/transactions/{id}` |
| `deleteTransaction(id)` | DELETE `/transactions/{id}` |

---

### 4.9 TypeScript Types

All types in `src/types/`.

#### api.ts
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

#### auth.ts
```typescript
interface LoginRequest { email: string; password: string }
interface RegisterRequest { email: string; password: string; confirmPassword: string; fullName: string }
interface AuthResponse { token: string; email: string; fullName: string; expiresAt: string }
interface User { email: string; fullName: string; token: string }
```

#### task.ts
```typescript
interface Task {
  id: number; title: string; description?: string; dueDate?: string;
  category?: string; priority?: string; statusCode: string; createdDate: string;
}
interface CreateTaskRequest { title: string; description?: string; dueDate?: string; category?: string; priority?: string }
interface UpdateTaskRequest extends CreateTaskRequest { id: number; statusCode: string }
```

#### bill.ts
```typescript
interface Bill { id: number; name: string; amount: number; dueDate: string; statusCode: string; reminderDaysBefore: number }
interface CreateBillRequest { name: string; amount: number; dueDate: string; reminderDaysBefore: number }
interface UpdateBillRequest extends CreateBillRequest { id: number; statusCode: string }
```

#### journal.ts
```typescript
interface JournalEntry { id: number; date: string; notes: string; statusCode: string; createdDate: string }
interface CreateJournalRequest { date: string; notes: string }
interface UpdateJournalRequest { id: number; date: string; notes: string }
```

#### receipt.ts
```typescript
interface Receipt {
  id: number; title: string; amount: number; date: string;
  category?: string; imagePath: string; statusCode: string; createdDate: string;
}
interface CreateReceiptRequest { title: string; amount: number; date: string; category?: string }
interface UpdateReceiptRequest extends CreateReceiptRequest { id: number }
```

#### transaction.ts
```typescript
type TransactionType = 'Income' | 'Expense'
interface Transaction { id: number; amount: number; type: TransactionType; category?: string; date: string; notes?: string; statusCode: string }
interface CreateTransactionRequest { amount: number; type: TransactionType; category?: string; date: string; notes?: string }
interface UpdateTransactionRequest extends CreateTransactionRequest { id: number }
```

#### dashboard.ts
```typescript
interface DashboardData {
  totalTasks: number; completedTasks: number; pendingTasks: number; overdueTasks: number;
  totalJournalEntries: number; totalReceipts: number; totalBills: number; unpaidBills: number;
  totalIncome: number; totalExpenses: number; netBalance: number;
  recentTasks?: Task[]; upcomingBills?: Bill[];
}
```

---

### 4.10 Internationalization (i18n)

#### Configuration (`src/i18n/index.ts`)
- **Languages:** English (`en`), Arabic (`ar`)
- **Default:** English
- **Fallback:** English
- **Persistence:** Saved to `localStorage('language')`
- **Direction:** Applies `dir="rtl"` and `lang="ar"` to `<html>` for Arabic
- **Direction applied before render** to prevent flicker

#### Translation Keys (500+ per language)

**Namespaces:**
| Namespace | Key Examples |
|-----------|-------------|
| `nav` | dashboard, tasks, bills, transactions, receipts, journal, profile, logout |
| `auth` | appName, login, register, email, password, confirmPassword, fullName, signingIn, creatingAccount, noAccount, haveAccount, passwordMismatch, serverError |
| `dashboard` | greeting, goodMorning, goodAfternoon, goodEvening, todayIs, totalTasks, completedTasks, pendingTasks, overdueTasks, totalIncome, totalExpenses, netBalance, recentTasks, upcomingBills, noBills, noTasks, amount, dueDate, loading, error, priority |
| `tasks` | title, newTask, editTask, taskTitle, description, dueDate, category, priority, priorityHigh, priorityMedium, priorityLow, priorityNone, filterAll, filterPending, filterCompleted, filterPriorityAll, complete, edit, delete, cancel, save, saveChanges, saving, noTasks, noTasksHint, loading, saved, updated, completed, deleted, search, noResults, noResultsHint |
| `bills` | title, newBill, editBill, name, amount, dueDate, reminderDays, reminderNote, pending, paid, overdue, markPaid, pendingCount, paidCount, noBills, noBillsHint, loading, saved, updated, deleted, markedPaid, search, noResults, noResultsHint, filterAll, filterPending, filterPaid |
| `transactions` | title, newTransaction, editTransaction, amount, type, income, expense, filterAll, date, notes, notesPlaceholder, totalIncome, totalExpenses, balance, noTransactions, noTransactionsHint, loading, saved, updated, deleted, search, noResults, noResultsHint |
| `receipts` | title, newReceipt, editReceipt, receiptTitle, amount, date, image, changeImage, dragImage, total, noReceipts, noReceiptsHint, loading, saved, updated, deleted, imageUpdated, search, noResults, noResultsHint |
| `journal` | title, newEntry, editEntry, date, notes, notesPlaceholder, entries_count, cancel, save, saveChanges, saving, edit, delete, noEntries, noEntriesHint, loading, saved, updated, deleted, search, noResults, noResultsHint |
| `profile` | title, darkMode, language, english, arabic, totalTasks, completedTasks, journalEntries, receipts |
| `categories` | placeholder, work, personal, health, finance, shopping, learning, other, salary, freelance, business, investment, gift, foodDining, transport, entertainment, utilities, education, rent |
| `common` | due, loading, error, retry, save, cancel, delete, edit, na, copyright, confirmDelete, confirmDeleteMsg, requiredField, saveChanges, saving, selectDate, dateFrom, dateTo, clearFilters |

All keys have both English and Arabic translations.

---

### 4.11 Utilities

#### CATEGORY_I18N_KEYS (`src/utils/categoryLabel.ts`)
Maps English database category values to i18n translation keys:

```typescript
{
  'Work': 'categories.work',
  'Personal': 'categories.personal',
  'Health': 'categories.health',
  'Finance': 'categories.finance',
  'Shopping': 'categories.shopping',
  'Learning': 'categories.learning',
  'Other': 'categories.other',
  'Salary': 'categories.salary',
  'Freelance': 'categories.freelance',
  'Business': 'categories.business',
  'Investment': 'categories.investment',
  'Gift': 'categories.gift',
  'Food & Dining': 'categories.foodDining',
  'Transport': 'categories.transport',
  'Entertainment': 'categories.entertainment',
  'Utilities': 'categories.utilities',
  'Education': 'categories.education',
  'Rent': 'categories.rent',
}
```

Used in pages to render localized category labels from English DB values.

---

### 4.12 Design System & CSS Tokens

#### Font
- **Family:** Tajawal (Google Fonts) — fallback to system sans-serif
- **Weights loaded:** 300, 400, 500, 700, 800

#### Light Mode Variables
| Token | Value | Purpose |
|-------|-------|---------|
| `--bg-base` | `#f7f5f0` | Page background (warm cream) |
| `--bg-surface` | `#ffffff` | Card/panel surfaces |
| `--bg-subtle` | `#ede9e0` | Hover tints |
| `--bg-muted` | `#e2ddd5` | Stronger muted bg |
| `--bg-input` | `#ffffff` | Input backgrounds |
| `--bg-sidebar` | `#f0ece4` | Sidebar panel |
| `--text-primary` | `#1a1715` | Main text |
| `--text-secondary` | `#4a4540` | Secondary text |
| `--text-muted` | `#9b948c` | Muted/placeholder text |
| `--border-default` | `#d5cfc6` | Standard borders |
| `--border-subtle` | `#e8e3da` | Subtle borders |
| `--border-focus` | `#c96030` | Focus ring border |
| `--accent` | `#c96030` | Primary accent (terracotta) |
| `--accent-hover` | `#b05428` | Accent hover state |
| `--accent-active` | `#9a4820` | Accent active state |
| `--accent-light` | `#fef3ec` | Light accent background |
| `--accent-text` | `#ffffff` | Text on accent backgrounds |
| `--success` | `#1a7a40` | Success color |
| `--success-bg` | `#edfaf3` | Success background |
| `--success-border` | `#b8e8cc` | Success border |
| `--warning` | `#a85d00` | Warning color |
| `--warning-bg` | `#fff8ec` | Warning background |
| `--warning-border` | `#fcd89a` | Warning border |
| `--danger` | `#bf1b1b` | Danger color |
| `--danger-bg` | `#fef2f2` | Danger background |
| `--danger-border` | `#fccaca` | Danger border |
| `--info` | `#1a65a8` | Info color |
| `--info-bg` | `#eff6ff` | Info background |
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Minimal shadow |
| `--shadow-sm` | `0 1px 3px...` | Small shadow |
| `--shadow-md` | `0 4px 12px...` | Medium shadow |
| `--shadow-lg` | `0 8px 24px...` | Large shadow |

#### Dark Mode Variables (`.dark` class)
| Token | Value |
|-------|-------|
| `--bg-base` | `#1a1917` |
| `--bg-surface` | `#222019` |
| `--bg-subtle` | `#2c2924` |
| `--bg-muted` | `#37342e` |
| `--bg-input` | `#272420` |
| `--bg-sidebar` | `#1e1c18` |
| `--text-primary` | `#eee8df` |
| `--text-secondary` | `#b0a99e` |
| `--text-muted` | `#6e6760` |
| `--border-default` | `#3c3830` |
| `--border-subtle` | `#2e2b26` |
| `--border-focus` | `#e07a44` |
| `--accent` | `#e07a44` |
| `--accent-hover` | `#cc6c38` |
| `--accent-active` | `#b85e2e` |
| `--accent-light` | `#2e1a0c` |
| `--success` | `#3ecf6e` |
| `--success-bg` | `#0c2318` |
| `--warning` | `#f4b740` |
| `--warning-bg` | `#1e1400` |
| `--danger` | `#f07070` |
| `--danger-bg` | `#220a0a` |
| `--info` | `#5ba0f0` |
| `--info-bg` | `#0a1a2e` |
| Shadows | Stronger opacities (0.25 – 0.50) |

#### CSS Classes
| Class | Description |
|-------|-------------|
| `.btn` | Base button (flex, centered, font-weight 600, rounded) |
| `.btn-sm` / `.btn-md` / `.btn-lg` | Size variants |
| `.btn-primary` | Accent background, white text |
| `.btn-secondary` | Subtle background, secondary text |
| `.btn-ghost` | Transparent, muted text |
| `.btn-danger` | Danger background, white text |
| `.btn-success` | Success background, white text |
| `.btn-accent-light` | Light accent background, accent text |
| `.card` | Surface background, subtle border, rounded, shadow |
| `.interactive-card` | Card with hover translate-y and shadow transition |
| `.badge` | Inline pill with font-weight 600, small text |
| `.status-pill` | Status indicator dot (8px circle) |
| `.divider` | 1px horizontal border line |

#### Animations
| Name | Effect |
|------|--------|
| `fadeUp` | Translate Y 12px → 0 + opacity 0 → 1 (0.35s) |
| `fadeIn` | Opacity 0 → 1 (0.25s) |
| `overlayFadeIn` | Opacity 0 → 1 for modal overlays |
| `panelSlideIn` | Translate X −100% → 0 (LTR slide) |
| `panelSlideInRTL` | Translate X 100% → 0 (RTL slide) |

#### Additional CSS Customizations
- Custom scrollbar styling (6px width, accent thumb)
- React-datepicker comprehensive theme override (calendar, headers, days, selected, today, popper)
- Responsive sidebar collapse button positioning
- Form panel styling
- RTL-aware transition origins

---

## 5. Database Schema

```
PersonalLifeOSDb (SQL Server LocalDB)
├── AspNetUsers (Identity — extended with FullName, PreferredLanguage, StatusCode, Audit fields)
├── AspNetRoles
├── AspNetUserRoles
├── AspNetUserClaims
├── AspNetUserLogins
├── AspNetUserTokens
├── AspNetRoleClaims
├── Tasks
│   ├── Id (int, PK)
│   ├── Title (nvarchar(200), NOT NULL)
│   ├── Description (nvarchar(1000), NULL)
│   ├── DueDate (datetime2, NULL)
│   ├── Category (nvarchar(50), NULL)
│   ├── Priority (nvarchar(max), NULL)
│   ├── StatusCode (nvarchar(20), NOT NULL)
│   ├── UserId (nvarchar(450), NOT NULL)
│   ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
│   └── Indexes: (UserId, StatusCode), (DueDate)
├── Bills
│   ├── Id (int, PK)
│   ├── Name (nvarchar(200), NOT NULL)
│   ├── Amount (decimal(18,2))
│   ├── DueDate (datetime2, NOT NULL)
│   ├── ReminderDaysBefore (int)
│   ├── StatusCode (nvarchar(20), NOT NULL)
│   ├── UserId (nvarchar(450), NOT NULL)
│   ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
│   └── Index: (UserId, DueDate, StatusCode)
├── DailyJournals
│   ├── Id (int, PK)
│   ├── Date (datetime2, NOT NULL)
│   ├── Notes (nvarchar(max), NOT NULL)
│   ├── StatusCode (nvarchar(20), NOT NULL)
│   ├── UserId (nvarchar(450), NOT NULL)
│   ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
│   └── Index: (UserId, Date)
├── Receipts
│   ├── Id (int, PK)
│   ├── Title (nvarchar(200), NOT NULL)
│   ├── ImagePath (nvarchar(500), NOT NULL)
│   ├── Amount (decimal(18,2))
│   ├── Date (datetime2, NOT NULL)
│   ├── Category (nvarchar(50), NULL)
│   ├── StatusCode (nvarchar(20), NOT NULL)
│   ├── UserId (nvarchar(450), NOT NULL)
│   ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
│   └── Index: (UserId, Date)
├── Transactions
│   ├── Id (int, PK)
│   ├── Amount (decimal(18,2))
│   ├── Type (int, NOT NULL — 0=Income, 1=Expense)
│   ├── Category (nvarchar(50), NULL)
│   ├── Date (datetime2, NOT NULL)
│   ├── Notes (nvarchar(500), NULL)
│   ├── StatusCode (nvarchar(20), NOT NULL)
│   ├── UserId (nvarchar(450), NOT NULL)
│   ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
│   └── Index: (UserId, Date, Type)
└── MonthlyPayments
    ├── Id (int, PK)
    ├── Title (nvarchar(200), NOT NULL)
    ├── Amount (decimal(18,2))
    ├── Month (int), Year (int)
    ├── StatusCode (nvarchar(20), NOT NULL)
    ├── UserId (nvarchar(450), NOT NULL)
    ├── Notes (nvarchar(500), NULL)
    ├── CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
    └── Index: (UserId, Year, Month)
```

---

## 6. Feature Matrix

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| User Registration | ✅ POST /auth/register | ✅ RegisterPage | Complete |
| User Login (JWT) | ✅ POST /auth/login | ✅ LoginPage + authStore | Complete |
| Protected Routes | ✅ [Authorize] attribute | ✅ ProtectedRoute component | Complete |
| Dashboard Stats | ✅ GET /dashboard | ✅ DashboardPage | Complete |
| Task CRUD | ✅ Full REST API | ✅ TasksPage | Complete |
| Task Priority | ✅ Priority field + DTO | ✅ Priority selector + badges | Complete |
| Task Complete | ✅ POST /tasks/{id}/complete | ✅ Checkbox button | Complete |
| Bill CRUD | ✅ Full REST API | ✅ BillsPage | Complete |
| Bill Mark Paid | ✅ POST /bills/{id}/pay | ✅ Mark Paid button | Complete |
| Journal CRUD | ✅ Full REST API | ✅ JournalPage | Complete |
| Receipt CRUD | ✅ Full REST API + Image | ✅ ReceiptsPage with upload | Complete |
| Receipt Image Update | ✅ PUT /receipts/{id}/image | ✅ Hover "Change Image" | Complete |
| Transaction CRUD | ✅ Full REST API | ✅ TransactionsPage | Complete |
| Search Filtering | — (client-side) | ✅ All 5 data pages | Complete |
| Date Range Filtering | — (client-side) | ✅ All 5 data pages | Complete |
| Status Filtering | — (client-side) | ✅ Tasks, Bills | Complete |
| Type Filtering | — (client-side) | ✅ Transactions | Complete |
| Priority Filtering | — (client-side) | ✅ Tasks | Complete |
| Soft Deletes | ✅ StatusCode = DELETED | ✅ ConfirmDialog before delete | Complete |
| Dark Mode | — | ✅ CSS variables + themeStore | Complete |
| RTL Support (Arabic) | — | ✅ Full RTL + i18n | Complete |
| Responsive Design | — | ✅ Mobile sidebar + responsive grids | Complete |
| Toast Notifications | — | ✅ Success/Error/Info toasts | Complete |
| Collapsible Sidebar | — | ✅ Desktop sidebar collapse | Complete |
| MonthlyPayment Entity | ✅ Entity + DbSet + Migration | ❌ No UI | Entity Only |
| Server-side Filtering | ❌ Not implemented | — | Not Started |
| Pagination | ❌ Not implemented | ❌ Not implemented | Not Started |

---

## Running the Application

### Backend
```bash
# Build
dotnet build PersonalLifeOS.slnx

# Run API (http://localhost:5207, Swagger UI at root)
cd PersonalLifeOS.API && dotnet run

# Add migration
cd PersonalLifeOS.Infrastructure && dotnet ef migrations add <Name> --startup-project ../PersonalLifeOS.API

# Apply migrations
cd PersonalLifeOS.Infrastructure && dotnet ef database update --startup-project ../PersonalLifeOS.API
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Type-check and build
npm run build

# Lint
npm run lint
```

### Test User
- **Email:** testuser@test.com
- **Password:** Test1234
- **Name:** Test User

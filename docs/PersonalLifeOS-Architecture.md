# Personal Life OS Architecture

## 1. Project Overview

Personal Life OS is a personal productivity and life management platform designed for individual use, built with production-grade architecture and engineering practices.

### Core Capabilities

- Task management
- Personal journal (daily journaling)
- Receipt storage and tracking
- Bill reminders and payment tracking
- Personal finance management
- Monthly payments and obligations tracking
- Daily notes
- Reminders
- File uploads

---

## 2. Technology Stack

### Backend

- .NET 8
- ASP.NET Core MVC
- ASP.NET Core Identity

### Architecture

- Clean Architecture

### Data

- SQL Server.
- Entity Framework Core

### Frontend

- Bootstrap 5
- Bootstrap Icons
- Moder UI

### Localization

- ASP.NET Core Localization (Arabic)

### File Storage

- Local file storage

---

## 3. Solution Architecture

The project follows **Clean Architecture** and is organized into four primary projects:

```text
PersonalLifeOS.Domain
├── Entities
├── Enums
└── Interfaces

PersonalLifeOS.Application
├── UseCases
├── DTOs
├── Services
└── Validators

PersonalLifeOS.Infrastructure
├── Persistence
├── Identity
├── Repositories
└── FileStorage

PersonalLifeOS.Web
├── Controllers
├── ViewModels
├── Views
├── Middleware
└── UI
```

### Layer Rules

- The **Domain** layer must not depend on any other layer.
- The **Application** layer contains business logic and use cases.
- The **Infrastructure** layer implements persistence, identity, repositories, and file storage.
- The **Web** layer contains UI, request handling, and presentation concerns only.

---

## 4. Data Model

### 4.0 Global Entity Conventions

All entities must include the following audit fields:

- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

All entities must include a unified status field:

- `StatusCode`

`StatusCode` replaces boolean lifecycle/state flags such as `IsCompleted`, `IsPaid`, and `IsDeleted`.
This allows flexible statuses (for example: `IsCompleted`, `Pending`, `Draft`, `Deleted`, `Cancelled`, `Active`).

### 4.1 Users

User identity is managed by ASP.NET Core Identity.

Additional profile fields may include:

- `FullName`
- `PreferredLanguage`
- `StatusCode`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

### 4.2 Tasks

Represents daily and general tasks.

Fields:

- `Id`
- `Title`
- `Description`
- `DueDate`
- `Category`
- `StatusCode`
- `UserId`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

Rules:

- Use `StatusCode` for task state (for example: `Pending`, `InProgress`, `IsCompleted`, `Deleted`).
- Records must never be physically deleted.

### 4.3 DailyJournal

Stores daily reflections.

Fields:

- `Id`
- `Date`
- `Notes`
- `StatusCode`
- `UserId`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

Rules:

- Only one journal entry per user per day.

### 4.4 Receipts

Stores uploaded receipt images.

Fields:

- `Id`
- `Title`
- `ImagePath`
- `Amount`
- `Date`
- `Category`
- `UserId`
- `StatusCode`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

Storage path:

- `wwwroot/uploads/receipts`

### 4.5 Bills

Represents recurring or manual bills.

Fields:

- `Id`
- `Name`
- `Amount`
- `DueDate`
- `ReminderDaysBefore`
- `StatusCode`
- `UserId`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

Examples:

- Electricity
- Internet
- Rent
- Subscriptions

### 4.6 Transactions

Represents personal financial transactions.

Fields:

- `Id`
- `Amount`
- `Type`
- `Category`
- `Date`
- `Notes`
- `StatusCode`
- `UserId`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

`Type` values:

- `Income`
- `Expense`

Examples:

- Salary
- Food
- Transport
- Bills

### 4.7 MonthlyPayments

Tracks monthly obligations.

Fields:

- `Id`
- `Title`
- `Amount`
- `Month`
- `Year`
- `StatusCode`
- `UserId`
- `Notes`
- `CreatedBy`
- `CreatedDate`
- `UpdatedBy`
- `UpdatedDate`

---

## 5. Soft Delete Policy

Entities using soft delete:

- Tasks
- Receipts

Rules:

- Mark deleted records using `StatusCode = "Deleted"`.
- Default queries must exclude deleted records (for example: `StatusCode != "Deleted"`).
- Do not physically delete soft-deletable records.

---

## 6. Authentication and Authorization

Authentication uses ASP.NET Core Identity.

### Features

- Login
- Logout
- Optional user registration

### Security Requirements

- Password hashing
- Anti-forgery tokens
- Authorization attributes
- Secure cookies

### Protected Areas

- Tasks
- Receipts
- Bills
- Finance
- Journal

---

## 7. File Upload Standards

Receipt images are stored in:

- `wwwroot/uploads/receipts`

Validation requirements:

- Maximum file size enforcement
- Image formats only
- Unique file names

---

## 8. UI and Navigation

### UI Stack

- Bootstrap 5
- Bootstrap Icons
- No external UI libraries

### Navigation

Main navigation:

- Dashboard
- Tasks
- Journal
- Receipts
- Bills
- Finance

Right-side navigation:

- Language switch
- Dark mode toggle
- Profile
- Logout

### Dashboard Widgets

- Today’s tasks
- Upcoming bills
- Monthly expenses
- Recent receipts
- Recent journal entries

---

## 9. Theming (Dark Mode)

Dark mode uses Bootstrap theme attributes:

- `data-bs-theme="dark"`

Rules:

- Persist theme selection in cookies.
- Maintain proper contrast for text and controls.
- Ensure dark mode styling for navbar, cards, and inputs.
- Keep light mode behavior unchanged.

Dark input guidelines:

- Background: dark
- Text: white
- Placeholder: gray
- Focus state: Bootstrap primary

---

## 10. Localization and RTL

Supported languages:

- English
- Arabic

Implementation:

- ASP.NET Core Localization
- `.resx` resource files
- Culture persisted in cookies

Arabic behavior:

- Enable RTL layout with `dir="rtl"`.
- Apply Arabic font only when Arabic is selected.

Recommended Arabic fonts:

- Cairo
- IBM Plex Sans Arabic
- Tajawal

---

## 11. Application Design Guidelines

### Controllers

Controllers must remain thin:

- Call Application use cases
- Return ViewModels
- Contain no business logic

### Application Layer Use Cases

Initial use cases include:

- CreateTask
- UpdateTask
- DeleteTask
- CompleteTask
- CreateJournalEntry
- UpdateJournalEntry
- UploadReceipt
- CreateBill
- MarkBillPaid
- AddTransaction

### Infrastructure Responsibilities

- DbContext
- Repository implementations
- Identity configuration
- File storage service

### Security Controls

- Anti-forgery tokens
- Secure cookies
- File upload validation
- Authorization checks

### Performance and Maintainability

Avoid:

- Inline styles
- Duplicated CSS
- Duplicated JavaScript

Also:

- Remove unused resources

---

## 12. AI Implementation Prompt

Use the following prompt with Claude (or a similar coding assistant) for incremental implementation:

```text
You are a senior ASP.NET Core architect.

Read PersonalLifeOS-Architecture.md.

This file defines the complete architecture of the system.

We will implement the system step by step.

Follow Clean Architecture strictly.

Start by generating the Domain entities and enums.

Do not generate other layers yet.
```

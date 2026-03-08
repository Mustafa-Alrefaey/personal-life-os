# React Learning Guide - From Zero to Hero

**Welcome!** Since you're new to React, I'll teach you everything you need to know as we build Personal Life OS.

---

## 🤔 What is React?

**React** is a JavaScript library for building user interfaces. Think of it like LEGO blocks:
- Each block is a **Component** (button, form, card)
- You combine blocks to build pages
- When data changes, React updates only what's needed (no page reload!)

**Key Difference from ASP.NET MVC:**
```
MVC (Old Way):
User clicks → Server renders new HTML → Full page reload

React (Modern Way):
User clicks → JavaScript updates DOM → Smooth, instant update
```

---

## 📚 Core Concepts (We'll Learn These)

### 1. Components (Building Blocks)

A component is a piece of UI. Like a LEGO block.

```tsx
// This is a component - a simple button
function MyButton() {
  return <button>Click me!</button>
}

// Use it anywhere
<MyButton />
```

**Types:**
- **Functional Components** (modern, what we'll use)
- Class Components (old way, skip it)

---

### 2. JSX (HTML in JavaScript)

JSX looks like HTML but it's actually JavaScript.

```tsx
// This looks like HTML, but it's JSX
const element = <h1>Hello, World!</h1>

// You can use JavaScript expressions inside {}
const name = "Alice"
const greeting = <h1>Hello, {name}!</h1>

// You can use JavaScript logic
const isLoggedIn = true
const message = (
  <div>
    {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in</p>}
  </div>
)
```

---

### 3. Props (Passing Data Down)

Props are like function parameters. You pass data to components.

```tsx
// Component that accepts props
function TaskCard(props) {
  return (
    <div>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </div>
  )
}

// Using it (passing props)
<TaskCard
  title="Buy groceries"
  description="Milk, eggs, bread"
/>
```

**Modern way (destructuring):**
```tsx
function TaskCard({ title, description }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
```

---

### 4. State (Data That Changes)

State is data that can change over time. When state changes, React re-renders.

```tsx
import { useState } from 'react'

function Counter() {
  // useState creates state
  // count = current value
  // setCount = function to update it
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}
```

**Key Rules:**
- Never modify state directly: ❌ `count = count + 1`
- Always use setter: ✅ `setCount(count + 1)`

---

### 5. Effects (Side Effects)

Effects run code after render (like API calls, timers).

```tsx
import { useEffect, useState } from 'react'

function TaskList() {
  const [tasks, setTasks] = useState([])

  // This runs after component mounts
  useEffect(() => {
    // Fetch tasks from API
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
  }, []) // Empty array = run once on mount

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

---

### 6. Event Handling

Handle clicks, form submissions, etc.

```tsx
function MyForm() {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault() // Prevent page reload
    alert(`Hello, ${name}!`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

### 7. Conditional Rendering

Show/hide elements based on conditions.

```tsx
function Dashboard({ isLoggedIn }) {
  // Early return
  if (!isLoggedIn) {
    return <p>Please log in</p>
  }

  // Ternary operator
  return (
    <div>
      <h1>Dashboard</h1>
      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  )
}
```

---

### 8. Lists and Keys

Render arrays of data.

```tsx
function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map(task => (
        // key is required for React to track items
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  )
}
```

**Important:** Always add `key` when mapping arrays!

---

## 🛠️ Tools We'll Use

### 1. Vite (Build Tool)

Vite is like a super-fast compiler. It:
- Bundles your code
- Hot-reloads when you save (instant updates!)
- Optimizes for production

**Commands:**
```bash
npm run dev    # Start development server
npm run build  # Build for production
```

---

### 2. TypeScript (Optional but Recommended)

TypeScript = JavaScript + Types. It catches errors before runtime.

```tsx
// JavaScript (no types)
function greet(name) {
  return `Hello, ${name}`
}

// TypeScript (with types)
function greet(name: string): string {
  return `Hello, ${name}`
}

// Interface for complex objects
interface Task {
  id: number
  title: string
  completed: boolean
}

function TaskCard({ task }: { task: Task }) {
  return <div>{task.title}</div>
}
```

---

### 3. TanStack Query (React Query)

Makes API calls super easy. Handles loading, errors, caching automatically.

```tsx
import { useQuery } from '@tanstack/react-query'

function TaskList() {
  // This handles loading, error, caching, refetching!
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json())
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

**Benefits:**
- Automatic caching
- Auto-refetch on window focus
- Loading and error states
- Mutations for POST/PUT/DELETE

---

### 4. Tailwind CSS (Styling)

Tailwind uses utility classes instead of writing CSS.

```tsx
// Traditional CSS
<div className="my-card">...</div>
/* In CSS file */
.my-card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

// Tailwind CSS (no CSS file needed!)
<div className="p-4 bg-white rounded-lg shadow-md">...</div>
```

**Common classes:**
- `p-4` = padding: 1rem
- `mt-2` = margin-top: 0.5rem
- `text-xl` = font-size: 1.25rem
- `bg-blue-500` = background: blue
- `flex` = display: flex
- `hidden md:block` = hide on mobile, show on desktop

---

### 5. React Router (Navigation)

For multi-page navigation without page reloads.

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/tasks">Tasks</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 🎯 Project Structure (What We'll Build)

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Basic components (Button, Card, etc.)
│   │   ├── TaskCard.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   │
│   ├── pages/               # Full page components
│   │   ├── Dashboard.tsx
│   │   ├── TasksPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   │
│   ├── services/            # API calls
│   │   ├── api.ts          # Axios setup
│   │   ├── auth.service.ts
│   │   └── tasks.service.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── task.ts
│   │   └── user.ts
│   │
│   ├── lib/                 # Utilities
│   │   └── utils.ts
│   │
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
│
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 📖 Learning Steps (What We'll Do Together)

### Week 1: Basics
1. ✅ Create React project with Vite
2. ✅ Understand components and JSX
3. ✅ Learn props and state
4. ✅ Build simple components (Button, Card)
5. ✅ Setup Tailwind CSS

### Week 2: API Integration
6. ✅ Setup axios for API calls
7. ✅ Learn TanStack Query
8. ✅ Build login/register pages
9. ✅ Handle authentication with JWT
10. ✅ Protected routes

### Week 3: Features
11. ✅ Build Dashboard
12. ✅ Build Tasks CRUD
13. ✅ Forms with validation
14. ✅ Loading states and errors
15. ✅ Toast notifications

### Week 4: Polish
16. ✅ Dark mode
17. ✅ Responsive design
18. ✅ Animations
19. ✅ Performance optimization
20. ✅ Deploy

---

## 💡 Tips for Success

### 1. Think in Components
Break UI into small pieces:
```
Dashboard Page
  ├── Navbar Component
  ├── Stats Cards Component
  │   └── Stat Card Component (reused 3x)
  ├── Recent Tasks Component
  │   └── Task Card Component
  └── Upcoming Bills Component
      └── Bill Card Component
```

### 2. One Component = One File
```
TaskCard.tsx    ← One component
TaskList.tsx    ← One component
Dashboard.tsx   ← One page (combines components)
```

### 3. Props Flow Down, Events Flow Up
```tsx
// Parent passes data down via props
<TaskCard task={task} onComplete={handleComplete} />

// Child calls callback to notify parent
function TaskCard({ task, onComplete }) {
  return (
    <button onClick={() => onComplete(task.id)}>
      Complete
    </button>
  )
}
```

### 4. Use DevTools
- React DevTools (Chrome extension)
- See component tree
- Inspect props and state
- Debug performance

---

## 🚀 Let's Start Building!

I'll teach you React **as we build** Personal Life OS. Each step will include:

1. **Explanation** - What we're doing and why
2. **Code** - The actual implementation
3. **Concepts** - React concepts used
4. **Practice** - You can modify and experiment

**Ready to start?** Let's create the API first, then jump into React! 🎨

---

## 📚 Resources for Later

Once you're comfortable, explore:
- [React Official Docs](https://react.dev) - Best learning resource
- [Tailwind CSS Docs](https://tailwindcss.com) - All utility classes
- [TanStack Query Docs](https://tanstack.com/query) - Advanced data fetching
- [shadcn/ui](https://ui.shadcn.com) - Beautiful components

**Don't rush** - We'll learn step by step! 🌟

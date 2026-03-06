import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import BillsPage from './pages/BillsPage';
import JournalPage from './pages/JournalPage';
import ReceiptsPage from './pages/ReceiptsPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { ToastProvider } from './components/ui/Toast';

const queryClient = new QueryClient();

function AppRoutes() {
  const initialize = useAuthStore((state) => state.initialize);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initialize();
    initializeTheme();
  }, [initialize, initializeTheme]);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tasks"         element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/bills"         element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
      <Route path="/journal"       element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      <Route path="/receipts"      element={<ProtectedRoute><ReceiptsPage /></ProtectedRoute>} />
      <Route path="/transactions"  element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"   element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectNewPage } from './pages/ProjectNewPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { ComponentsPage } from './pages/ComponentsPage';
import { TemplatesPage, DocsPage, SettingsPage } from './pages/SecondaryPages';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center font-mono text-cyan-400 text-xs">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Authenticated Engineering Workspace Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/projects/new" element={
                <ProtectedRoute>
                  <ProjectNewPage />
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId" element={
                <ProtectedRoute>
                  <ProjectWorkspacePage />
                </ProtectedRoute>
              } />
              <Route path="/components" element={
                <ProtectedRoute>
                  <ComponentsPage />
                </ProtectedRoute>
              } />
              <Route path="/templates" element={
                <ProtectedRoute>
                  <TemplatesPage />
                </ProtectedRoute>
              } />
              <Route path="/docs" element={
                <ProtectedRoute>
                  <DocsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />

              {/* Admin Panel */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

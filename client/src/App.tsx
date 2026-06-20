import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Suspense, lazy, type ReactNode } from 'react';

// Layout
import AppShell from './components/layout/AppShell';

// Auth pages (eager loaded)
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

// Lazy-loaded feature pages
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const TrackerPage = lazy(() => import('./features/tracker/pages/TrackerPage'));
const TwinPage = lazy(() => import('./features/twin/pages/TwinPage'));
const AIEnginePage = lazy(() => import('./features/ai-engine/pages/AIEnginePage'));
const CoachPage = lazy(() => import('./features/coach/pages/CoachPage'));
const ForecastPage = lazy(() => import('./features/forecast/pages/ForecastPage'));
const ChallengesPage = lazy(() => import('./features/challenges/pages/ChallengesPage'));
const LeaderboardPage = lazy(() => import('./features/gamification/pages/LeaderboardPage'));
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage'));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="animate-spin h-8 w-8 border-4 border-eco-500 border-t-transparent rounded-full" aria-label="Loading" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingFallback />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense>} />
              <Route path="tracker" element={<Suspense fallback={<LoadingFallback />}><TrackerPage /></Suspense>} />
              <Route path="twin" element={<Suspense fallback={<LoadingFallback />}><TwinPage /></Suspense>} />
              <Route path="ai" element={<Suspense fallback={<LoadingFallback />}><AIEnginePage /></Suspense>} />
              <Route path="coach" element={<Suspense fallback={<LoadingFallback />}><CoachPage /></Suspense>} />
              <Route path="forecast" element={<Suspense fallback={<LoadingFallback />}><ForecastPage /></Suspense>} />
              <Route path="challenges" element={<Suspense fallback={<LoadingFallback />}><ChallengesPage /></Suspense>} />
              <Route path="leaderboard" element={<Suspense fallback={<LoadingFallback />}><LeaderboardPage /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>} />
              <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense>} />
              <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

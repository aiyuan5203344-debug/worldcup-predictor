import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ErrorBoundary from './components/Common/ErrorBoundary'
import ScrollToTop from './components/Common/ScrollToTop'
import Navbar from './components/Layout/Navbar'
import BottomNav from './components/Layout/BottomNav'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Matches = lazy(() => import('./pages/Matches'))
const MatchDetail = lazy(() => import('./pages/MatchDetail'))
const Predict = lazy(() => import('./pages/Predict'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Charts = lazy(() => import('./pages/Charts'))
const Admin = lazy(() => import('./pages/Admin'))
const Teams = lazy(() => import('./pages/Teams'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading component for Suspense
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const token = localStorage.getItem('accessToken')

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <div className="min-h-screen bg-bg-primary">
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1a2332',
                      color: '#f8fafc',
                      border: '1px solid #1e293b',
                    },
                  }}
                />
                {token && <Navbar />}
                <ScrollToTop />
                <main className={token ? 'pt-[70px]' : ''}>
                  <Suspense fallback={<PageLoading />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/" element={<Home />} />
                      <Route path="/matches" element={
                        <ProtectedRoute><Matches /></ProtectedRoute>
                      } />
                      <Route path="/matches/:id" element={
                        <ProtectedRoute><MatchDetail /></ProtectedRoute>
                      } />
                      <Route path="/predict" element={
                        <ProtectedRoute><Predict /></ProtectedRoute>
                      } />
                      <Route path="/leaderboard" element={
                        <ProtectedRoute><Leaderboard /></ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                      } />
                      <Route path="/charts" element={
                        <ProtectedRoute><Charts /></ProtectedRoute>
                      } />
                      <Route path="/teams" element={
                        <ProtectedRoute><Teams /></ProtectedRoute>
                      } />
                      <Route path="/admin" element={
                        <ProtectedRoute><Admin /></ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                {token && <BottomNav />}
              </div>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store/store'
import { logout } from './store/authSlice'
import mockStore from './services/mockDataStore'
import Navbar from './components/layout/Navbar'
import DotField from './components/DotField'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import SessionList from './pages/SessionList'
import SubjectList from './pages/SubjectList'
import MyEnrollments from './pages/MyEnrollments'
import MentorProfiles from './pages/MentorProfiles'
import SupportDashboard from './pages/SupportDashboard'
import './App.css'

import { LEARNER_PROFILE_BG, MENTOR_PROFILE_BG } from './config/imageLinks'

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token)
  return token ? children : <Navigate to="/login" replace />
}

function AppRoutes({ isLearner, isMentor }) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  // Enforce mentor status: if a logged-in mentor is rejected or revoked/blocked, log them out immediately
  useEffect(() => {
    if (token && user?.role === 'MENTOR') {
      const checkMentorStatus = () => {
        mockStore.syncFromStorage()
        const mentorRecord = mockStore.findUserByEmail(user.email)
        if (
          mentorRecord &&
          (mentorRecord.status === 'REJECTED' ||
            mentorRecord.status === 'BLOCKED' ||
            mentorRecord.status === 'REVOKED')
        ) {
          dispatch(logout())
        }
      }
      checkMentorStatus()
      window.addEventListener('storage', checkMentorStatus)
      return () => window.removeEventListener('storage', checkMentorStatus)
    }
  }, [token, user, dispatch])

  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  const shellThemeClass = isLearner
    ? 'learner-shell learner-theme glass-profile-theme'
    : isMentor
    ? 'mentor-shell mentor-theme glass-profile-theme'
    : ''

  return (
    <div className={`app-shell ${shellThemeClass}`}>
      <Navbar user={user} />
      <main className={`page-shell ${isLearner || isMentor ? 'profile-page-shell' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/enrollments" element={<MyEnrollments />} />
          <Route path="/mentors" element={<MentorProfiles />} />
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AppLayout() {
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)
  const role = user?.role || 'LEARNER'
  const isLearner = Boolean(token && role === 'LEARNER')
  const isMentor = Boolean(token && role === 'MENTOR')
  const hasProfileTheme = isLearner || isMentor

  const profileBg = isLearner
    ? LEARNER_PROFILE_BG
    : isMentor
    ? MENTOR_PROFILE_BG
    : null

  return (
    <div
      className={`app-root-container ${isLearner ? 'learner-mode' : ''} ${
        isMentor ? 'mentor-mode' : ''
      }`}
    >
      {/* Background Image & Slight Darkening Overlay for Profile Pages */}
      {profileBg && (
        <div
          className="profile-bg-layer"
          style={{ backgroundImage: `url(${profileBg})` }}
          aria-hidden="true"
        >
          <div className="profile-bg-overlay" />
        </div>
      )}

      {/* Render DotField only where necessary (authenticated profile pages), NEVER on landing page */}
      {token && hasProfileTheme && (
        <div className="background-dotfield-wrapper">
          <DotField
            dotRadius={2.8}
            dotSpacing={34}
            cursorRadius={180}
            bulgeStrength={75}
            waveAmplitude={0}
            baseColor="rgba(255, 255, 255, 0.18)"
            activeGradientFrom="#93c5fd"
            activeGradientTo="#60a5fa"
            glowColor="#60a5fa"
          />
        </div>
      )}

      <AppRoutes isLearner={isLearner} isMentor={isMentor} />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </Provider>
  )
}

export default App



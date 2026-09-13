import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StatCards from '../components/layout/StatCards'
import SubjectChart from '../components/layout/SubjectChart'
import Timeline from '../components/layout/Timeline'
import EnrollmentCard from '../components/layout/EnrollmentCard'
import { getStats } from '../services/userService'
import { getAll as getAllSessions } from '../services/sessionService'
import { getMyEnrollments } from '../services/enrollmentService'
import mockStore from '../services/mockDataStore'
import { getDashboardAvatar } from '../config/imageLinks'

function Home() {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('loom_user'))
    } catch (e) {
      return null
    }
  }, [])

  const currentUser = user || storedUser
  const displayName = currentUser?.fullName || currentUser?.name || 'John Doe'
  const role = currentUser?.role || 'LEARNER'
  const isMentorPending = currentUser?.status === 'PENDING'

  useEffect(() => {
    mockStore.syncFromStorage()
    // Instantly hydrate default cache so the screen paints immediately
    if (!stats) setStats(mockStore.getStats())
    if (recentSessions.length === 0) setRecentSessions(mockStore.getSessions())
    if (enrollments.length === 0) setEnrollments(mockStore.getEnrollmentsForLearner(currentUser?.id || 3))

    const fetchData = async () => {
      try {
        const learnerId = currentUser?.id || 3
        const [statsOutcome, sessionsOutcome, enrollmentsOutcome] = await Promise.allSettled([
          getStats(),
          getAllSessions(0, 50),
          getMyEnrollments(learnerId),
        ])

        if (statsOutcome.status === 'fulfilled') {
          const sRes = statsOutcome.value
          const sData = sRes?.data !== undefined ? sRes.data : sRes
          setStats(sData || mockStore.getStats())
        } else {
          setStats(mockStore.getStats())
        }

        if (sessionsOutcome.status === 'fulfilled') {
          const sessRes = sessionsOutcome.value
          const sessionList = sessRes?.content || sessRes?.data?.content || (Array.isArray(sessRes) ? sessRes : [])
          setRecentSessions(sessionList.length > 0 ? sessionList : mockStore.getSessions())
        } else {
          setRecentSessions(mockStore.getSessions())
        }

        if (enrollmentsOutcome.status === 'fulfilled') {
          const enrollRes = enrollmentsOutcome.value
          const enrollList = Array.isArray(enrollRes) ? enrollRes : (enrollRes?.data || mockStore.getEnrollmentsForLearner(learnerId))
          setEnrollments(enrollList)
        } else {
          setEnrollments(mockStore.getEnrollmentsForLearner(learnerId))
        }
      } catch (error) {
        setStats(mockStore.getStats())
        setRecentSessions(mockStore.getSessions())
        setEnrollments(mockStore.getEnrollmentsForLearner(currentUser?.id || 3))
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const handleSync = () => {
      fetchData()
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('loom_enrollment_change', handleSync)

    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('loom_enrollment_change', handleSync)
    }
  }, [currentUser])

  // Role-specific KPI metrics
  const statCards = useMemo(() => {
    if (!stats) return []

    if (role === 'ACADEMIC_ADMIN') {
      return [
        { label: 'Total Learners', value: stats.totalLearners ?? 10 },
        { label: 'Approved Mentors', value: stats.approvedMentors ?? stats.totalMentors ?? 8 },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    if (role === 'MENTOR') {
      return [
        { label: 'Total Learners', value: stats.totalLearners ?? 10 },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    if (role === 'SUPPORT_AGENT') {
      return [
        { label: 'Learner Reviews', value: mockStore.getFeedbacks().length },
        { label: 'Average Rating', value: '4.8 ★' },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    // Default Learner KPI metrics (derived directly from live enrollments state)
    const userEnrollments = enrollments.length > 0
      ? enrollments
      : mockStore.getEnrollmentsForLearner(currentUser?.id || 3)
    const completedCount = userEnrollments.filter((e) => (e.status || '').toUpperCase() === 'COMPLETED' || (e.status || '').toUpperCase() === 'ATTENDED').length
    const activeCount = userEnrollments.filter((e) => (e.status || '').toUpperCase() === 'ENROLLED').length

    return [
      { label: 'Enrolled Sessions', value: activeCount },
      { label: 'Completed Sessions', value: completedCount },
      { label: 'Available Subjects', value: stats.subjectStats?.length || 5 },
      { label: 'Approved Mentors', value: stats.approvedMentors ?? stats.totalMentors ?? 8 },
    ]
  }, [stats, role, currentUser, enrollments])

  // Recent Platform Activity Timeline
  const activities = useMemo(() => {
    const items = []

    // Live session activity events
    if (recentSessions && recentSessions.length > 0) {
      recentSessions.slice(0, 4).forEach((sess) => {
        items.push({
          type: 'SESSION',
          category: sess.status || 'SESSION',
          title: sess.title,
          detail: `Mentor: ${sess.mentor?.fullName || 'Faculty Mentor'} | Subject: ${sess.subject?.name || 'Academic'} | Capacity: ${sess.currentEnrollment || 0}/${sess.maxCapacity || 10}`,
          time: sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
          badge: sess.status,
          badgeClass: sess.status === 'ACTIVE' ? 'badge-active' : sess.status === 'COMPLETED' ? 'badge-approved' : 'badge-scheduled',
        })
      })
    }

    // Platform milestones
    if (stats?.activities && stats.activities.length > 0) {
      stats.activities.forEach((act) => {
        if (!items.some((i) => i.title === act.title)) {
          items.push(act)
        }
      })
    } else {
      items.push({
        type: 'PLATFORM',
        category: 'ACADEMIC',
        title: 'Platform Academic Capacity',
        detail: `${stats?.scheduledSessions || 21} tutoring sessions scheduled across active subject disciplines`,
        time: 'Live System',
      })
      items.push({
        type: 'FACULTY',
        category: 'MENTOR',
        title: 'Mentor Network Active',
        detail: `${stats?.approvedMentors || stats?.totalMentors || 8} verified academic mentors providing peer guidance`,
        time: 'Verified',
      })
    }

    return items
  }, [stats, recentSessions])

  // Mentor's assigned sessions
  const mentorSessions = useMemo(() => {
    if (role !== 'MENTOR') return []
    const mId = currentUser?.id || 2
    const mEmail = currentUser?.email?.toLowerCase().trim()
    const all = recentSessions.length > 0 ? recentSessions : mockStore.getSessions()
    return all.filter((s) => {
      const matchId = mId != null && s.mentor?.id != null && String(s.mentor.id) === String(mId)
      const matchEmail = Boolean(mEmail && s.mentor?.email && s.mentor.email.toLowerCase().trim() === mEmail)
      return matchId || matchEmail
    })
  }, [recentSessions, role, currentUser])

  const displayedMentorSessions = useMemo(() => {
    return mentorSessions.slice(0, 4)
  }, [mentorSessions])

  const activeMentorSessionCount = useMemo(() => {
    return mentorSessions.filter(
      (s) => (s.status || '').toUpperCase() === 'ACTIVE' || (s.status || '').toUpperCase() === 'SCHEDULED'
    ).length
  }, [mentorSessions])

  // Mentor's upcoming scheduled sessions timeline
  const mentorScheduledActivities = useMemo(() => {
    if (role !== 'MENTOR') return []
    return [...mentorSessions]
      .sort((a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0))
      .map((sess) => ({
        type: 'SESSION',
        category: sess.status || 'SCHEDULED',
        title: sess.title,
        detail: `Subject: ${sess.subject?.name || 'Academic'} | Capacity: ${sess.currentEnrollment || 0}/${sess.maxCapacity || 10} Enrolled | Start: ${sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}`,
        time: sess.startTime ? new Date(sess.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Upcoming',
        badge: sess.status,
        badgeClass: sess.status === 'ACTIVE' ? 'badge-active' : sess.status === 'COMPLETED' ? 'badge-approved' : 'badge-scheduled',
      }))
  }, [mentorSessions, role])

  // Sort and pick top enrolled courses for dashboard view (Learner only)
  const displayedEnrollments = useMemo(() => {
    if (role !== 'LEARNER' && role) return []
    if (!enrollments || enrollments.length === 0) return []
    // Prioritize active (ENROLLED) sessions first, then COMPLETED, up to 4 cards
    return [...enrollments]
      .sort((a, b) => {
        const order = { ENROLLED: 1, ATTENDED: 2, COMPLETED: 3, CANCELLED: 4 }
        const statusA = (a.status || '').toUpperCase()
        const statusB = (b.status || '').toUpperCase()
        return (order[statusA] || 5) - (order[statusB] || 5)
      })
      .slice(0, 4)
  }, [enrollments, role])

  const activeEnrollmentCount = useMemo(() => {
    if (role !== 'LEARNER' && role) return 0
    return enrollments.filter(
      (e) => (e.status || '').toUpperCase() === 'ENROLLED'
    ).length
  }, [enrollments, role])

  return (
    <div className="page container">
      {/* Welcome Banner with Action CTA */}
      <div
        className="card welcome-banner"
        style={{
          marginBottom: '24px',
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(23, 32, 90, 0.7), rgba(12, 15, 29, 0.85))',
          border: '1px solid rgba(66, 96, 229, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flex: '1', minWidth: '280px', zIndex: 1, flexWrap: 'wrap' }}>
          <img
            src={getDashboardAvatar(role)}
            alt={`${role} Illustration`}
            style={{
              height: '92px',
              width: 'auto',
              maxHeight: '100px',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.45))',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          <div style={{ flex: '1', minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--color-light-blue)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ✦ LoomLearn Peer Learning Hub
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', color: 'var(--color-soft-white)' }}>
              Welcome back, {displayName}!
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5' }}>
              {role === 'ACADEMIC_ADMIN' && 'Oversee campus curriculum, audit mentor qualifications, and analyze student enrollment trends.'}
              {role === 'MENTOR' && 'Schedule and lead peer tutoring cohorts, manage interactive lesson capacities, and track student learning outcomes.'}
              {role === 'LEARNER' && 'Explore scheduled peer tutoring sessions, reserve your seat, and review your enrolled courses.'}
              {role === 'SUPPORT_AGENT' && 'Review learner feedback, inspect mentor performance ratings, and manage student assistance tickets.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', zIndex: 1 }}>
          {(role === 'ACADEMIC_ADMIN' || role === 'MENTOR') && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/sessions')}
              style={{ padding: '10px 22px', fontSize: '0.95rem', boxShadow: '0 4px 18px rgba(66, 96, 229, 0.45)' }}
            >
              Manage Sessions &rarr;
            </button>
          )}

          {role === 'LEARNER' && (
            <>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate('/sessions')}
                style={{ padding: '10px 20px', fontSize: '0.92rem' }}
              >
                Browse Sessions &rarr;
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate('/enrollments')}
                style={{ padding: '10px 20px', fontSize: '0.92rem' }}
              >
                My Enrollments
              </button>
            </>
          )}

          {role === 'SUPPORT_AGENT' && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/support')}
              style={{ padding: '10px 22px', fontSize: '0.95rem' }}
            >
              Open Support Dashboard &rarr;
            </button>
          )}
        </div>
      </div>

      {isMentorPending && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            border: '1px solid rgba(250, 204, 21, 0.4)',
            background: 'rgba(250, 204, 21, 0.08)',
            padding: '16px 20px',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div>
              <strong style={{ color: '#fef08a', fontSize: '1rem' }}>Mentor Account Pending Review</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Your mentor profile is currently under review by an Academic Administrator. You can explore the platform while awaiting approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader" data-testid="loader">Loading...</div>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <StatCards stats={statCards} />

          {/* Learner Profile: My Enrollments Section */}
          {role === 'LEARNER' && (
            <div className="my-enrollments-section">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <h3 className="section-heading">
                    <span>My Enrollments</span>
                    {activeEnrollmentCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--color-lilac)',
                          background: 'rgba(66, 96, 229, 0.18)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: '1px solid rgba(120, 132, 215, 0.3)',
                        }}
                      >
                        {activeEnrollmentCount} Active
                      </span>
                    )}
                  </h3>
                  <p className="section-subheading">
                    Continue where you left off in your enrolled peer learning courses
                  </p>
                </div>

                <button
                  type="button"
                  className="view-all-action-btn"
                  onClick={() => navigate('/enrollments')}
                  title="View all enrolled sessions"
                >
                  <span>View all</span>
                  <span className="arrow-icon">&rarr;</span>
                </button>
              </div>

              {/* Side-by-side compact horizontal cards */}
              {displayedEnrollments.length > 0 ? (
                <div className="enrollment-cards-grid">
                  {displayedEnrollments.map((enrollment) => {
                    const session = recentSessions.find(
                      (s) => String(s.id) === String(enrollment.sessionId)
                    )
                    return (
                      <EnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        session={session}
                        onClick={() => navigate('/enrollments')}
                      />
                    )
                  })}
                </div>
              ) : (
                <div
                  className="empty-state"
                  style={{
                    padding: '36px 20px',
                    background: 'rgba(23, 32, 90, 0.15)',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <p style={{ margin: 0, color: 'var(--color-soft-white)', fontSize: '1rem', fontWeight: 600 }}>
                    No course enrollments yet
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Explore scheduled peer tutoring sessions and reserve your seat to get started.
                  </p>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: '8px 20px', fontSize: '0.88rem', marginTop: '4px' }}
                    onClick={() => navigate('/sessions')}
                  >
                    Browse Available Sessions &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mentor Profile: My Sessions Section */}
          {role === 'MENTOR' && (
            <div className="my-enrollments-section my-sessions-section">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <h3 className="section-heading">
                    <span>My Sessions</span>
                    {activeMentorSessionCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--color-lilac)',
                          background: 'rgba(66, 96, 229, 0.18)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: '1px solid rgba(120, 132, 215, 0.3)',
                        }}
                      >
                        {activeMentorSessionCount} Active
                      </span>
                    )}
                  </h3>
                  <p className="section-subheading">
                    Manage and monitor your upcoming and active peer tutoring cohorts
                  </p>
                </div>

                <button
                  type="button"
                  className="view-all-action-btn"
                  onClick={() => navigate('/sessions?tab=my')}
                  title="View all your mentoring sessions"
                >
                  <span>View all</span>
                  <span className="arrow-icon">&rarr;</span>
                </button>
              </div>

              {/* Side-by-side compact horizontal cards */}
              {displayedMentorSessions.length > 0 ? (
                <div className="enrollment-cards-grid">
                  {displayedMentorSessions.map((session) => (
                    <EnrollmentCard
                      key={session.id}
                      session={session}
                      isMentor={true}
                      onClick={() => navigate('/sessions?tab=my')}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="empty-state"
                  style={{
                    padding: '36px 20px',
                    background: 'rgba(23, 32, 90, 0.15)',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <p style={{ margin: 0, color: 'var(--color-soft-white)', fontSize: '1rem', fontWeight: 600 }}>
                    No mentoring sessions scheduled yet
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Create your first cohort session and invite peer learners to enroll.
                  </p>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: '8px 20px', fontSize: '0.88rem', marginTop: '4px' }}
                    onClick={() => navigate('/sessions')}
                  >
                    + Schedule a Session &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Section: Role-specific feeds */}
          <div
            className="dashboard-bottom-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: role === 'ACADEMIC_ADMIN' ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
              gap: '24px',
              marginTop: '24px',
            }}
          >
            {/* Academic Admin: Student Enrollments per Subject & Recent Activity */}
            {role === 'ACADEMIC_ADMIN' && (
              <>
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                        Student Enrollments per Subject
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Active learner engagement by subject curriculum
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-light-blue)',
                        background: 'rgba(66, 96, 229, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Live Metrics
                    </span>
                  </div>
                  <SubjectChart data={stats?.subjectStats || mockStore.getStats().subjectStats} />
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                        Recent Platform Activity
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Joined events, session lifecycle updates, and feedback milestones
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#6ee7b7',
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Realtime
                    </span>
                  </div>
                  <Timeline activities={activities} />
                </div>
              </>
            )}

            {/* Mentor: My Scheduled Tutoring Sessions Schedule (No SubjectChart) */}
            {role === 'MENTOR' && (
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                      My Scheduled Tutoring Schedule
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Upcoming cohort timetable, student capacity, and session agendas
                    </span>
                  </div>
                  <button
                    type="button"
                    className="view-all-action-btn"
                    onClick={() => navigate('/sessions?tab=my')}
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <span>Manage All</span>
                    <span className="arrow-icon">&rarr;</span>
                  </button>
                </div>

                {mentorScheduledActivities.length > 0 ? (
                  <Timeline activities={mentorScheduledActivities} />
                ) : (
                  <div className="empty-state" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 8px', color: '#fff', fontWeight: 600 }}>No upcoming sessions scheduled</p>
                    <p style={{ margin: '0 0 16px', fontSize: '0.88rem' }}>Create your first cohort session and invite learners to participate.</p>
                    <button type="button" className="primary-btn" onClick={() => navigate('/sessions')}>
                      + Schedule a Session &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Learner: Learning Activity & Milestones (No SubjectChart) */}
            {role === 'LEARNER' && (
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                      Learning Activity & Milestones
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Track your enrolled lesson attendances, schedules, and reviews
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#6ee7b7',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Personalized
                  </span>
                </div>
                <Timeline activities={activities} />
              </div>
            )}

            {/* Support Agent: Reviews & Feedback timeline */}
            {role === 'SUPPORT_AGENT' && (
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                      Support & Activity Timeline
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Platform student feedback and mentor performance
                    </span>
                  </div>
                </div>
                <Timeline activities={activities} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Home

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile, logout } from '../../store/authSlice'
import { PRESET_AVATAR_LINKS } from '../../config/imageLinks'

const PRESET_AVATARS = PRESET_AVATAR_LINKS

export const getDefaultAvatar = (user) => {
  if (user?.avatarUrl) return user.avatarUrl
  if (user?.role === 'ACADEMIC_ADMIN') return PRESET_AVATARS[0].url
  if (user?.role === 'MENTOR') return PRESET_AVATARS[2].url
  if (user?.role === 'SUPPORT_AGENT') return PRESET_AVATARS[4].url
  return PRESET_AVATARS[3].url
}

function UserProfileModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    bio: '',
    avatarUrl: '',
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        department: user.department || (user.role === 'ACADEMIC_ADMIN' ? 'Administration' : 'Computer Science'),
        bio: user.bio || (user.role === 'ACADEMIC_ADMIN' ? 'Academic Administrator overseeing faculty verification and curriculum quality.' : user.role === 'MENTOR' ? 'Senior academic mentor committed to student mastery and interactive peer tutoring.' : user.role === 'SUPPORT_AGENT' ? 'Platform support specialist monitoring learner feedback and quality assurance.' : 'Dedicated learner actively participating in scheduled peer tutoring sessions.'),
        avatarUrl: getDefaultAvatar(user),
      })
      setIsEditing(false)
      setSaveSuccess(false)
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const roleLabel =
    user.role === 'ACADEMIC_ADMIN'
      ? 'Academic Admin'
      : user.role === 'MENTOR'
      ? 'Mentor Faculty'
      : user.role === 'SUPPORT_AGENT'
      ? 'Support Agent'
      : 'Learner'

  const handleSave = (e) => {
    e.preventDefault()
    dispatch(updateProfile(formData))
    setSaveSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div
      className="frosted-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 20, 0.65)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="frosted-glass-modal"
        style={{
          width: 'min(520px, 100%)',
          background: 'linear-gradient(135deg, rgba(20, 26, 54, 0.68), rgba(12, 16, 36, 0.78))',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(66, 96, 229, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-blue)' }}>
              LoomLearn Account
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2px 0 0', color: '#fff' }}>User Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {saveSuccess && (
          <div
            style={{
              marginBottom: '18px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Profile details updated successfully!
          </div>
        )}

        {/* Profile Card Main Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Avatar with glowing ring */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <img
              src={formData.avatarUrl || getDefaultAvatar(user)}
              alt={user.fullName || 'User'}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #5373ff',
                boxShadow: '0 0 20px rgba(83, 115, 255, 0.5)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                width: '18px',
                height: '18px',
                background: '#10b981',
                border: '3px solid #0f1424',
                borderRadius: '50%',
              }}
              title="Active & Verified"
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
            {formData.fullName || user.fullName}
          </h3>
          <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {formData.email || user.email}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'rgba(66, 96, 229, 0.25)',
                color: 'var(--color-light-blue)',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(66, 96, 229, 0.4)',
              }}
            >
              {roleLabel}
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              Verified Account
            </span>
          </div>
        </div>

        {/* View / Edit Mode Form */}
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Profile Image:
              </label>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 0 8px' }}>
                {PRESET_AVATARS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av.url}
                    alt={av.label}
                    onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: formData.avatarUrl === av.url ? '2px solid #5373ff' : '2px solid transparent',
                      boxShadow: formData.avatarUrl === av.url ? '0 0 10px #5373ff' : 'none',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Or Custom Image URL:
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name:
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Department / Discipline:
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Academic Bio:
              </label>
              <textarea
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                className="primary-btn"
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Department
                </span>
                <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{formData.department}</strong>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Authentication
                </span>
                <strong style={{ fontSize: '0.88rem', color: '#6ee7b7' }}>JWT Bearer</strong>
              </div>
            </div>

            {/* Bio Section */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                marginBottom: '22px',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Academic Profile & Bio
              </span>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#e2e8f0' }}>
                {formData.bio}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setIsEditing(true)}
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  onClose()
                  dispatch(logout())
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfileModal

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLandingFrameUrls } from '../config/imageLinks'
import './Landing.css'

// ── Frame sequence ──────────────────────────────────────────────────────────
const TOTAL_FRAMES = 41
const frames = getAllLandingFrameUrls()

// ── Preload images with GPU decode & Progressive streaming ──────────────────
// ── Preload images with GPU decode & Progressive streaming ──────────────────
function startProgressiveLoading(onFirstFrameReady, onProgress, onComplete) {
  let loaded = 0
  const images = new Array(TOTAL_FRAMES)

  const loadFrame = (index) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      let done = false

      const finish = () => {
        if (done) return
        done = true
        images[index] = img
        loaded++
        if (onProgress) onProgress(loaded / TOTAL_FRAMES)
        resolve(img)
      }

      const onError = () => {
        const fallbackSrc = `/Scroll_frames/frame_${String(index + 1).padStart(3, '0')}.png`
        if (img.src !== fallbackSrc && !img.src.endsWith(fallbackSrc)) {
          img.onerror = finish
          img.onload = finish
          img.src = fallbackSrc
        } else {
          finish()
        }
      }

      img.onload = finish
      img.onerror = onError
      img.src = frames[index]

      if ('decode' in img) {
        img.decode().then(finish).catch(onError)
      }
    })
  }

  // 1. Load initial Frame 0 first and unlock the page immediately!
  loadFrame(0).then(() => {
    if (onFirstFrameReady) onFirstFrameReady(images)

    // 2. High-priority batch: stage 1 frames (1..6)
    const earlyBatch = [1, 2, 3, 4, 5, 6].map((idx) => loadFrame(idx))
    Promise.all(earlyBatch).then(() => {
      // 3. Stream remaining frames progressively in background
      const remaining = []
      for (let i = 7; i < TOTAL_FRAMES; i++) {
        remaining.push(loadFrame(i))
      }
      Promise.all(remaining).then(() => {
        if (onComplete) onComplete(images)
      })
    })
  })

  return images
}


// ── Navigation Stage Anchors ────────────────────────────────────────────────
const STAGES = [
  { label: 'Overview',    frame: 0,  targetFrame: 0 },
  { label: 'Deep Focus',  frame: 7,  targetFrame: 14 },
  { label: 'Concurrency', frame: 24, targetFrame: 27 },
  { label: 'Workspace',   frame: 33, targetFrame: 36 },
]

export default function Landing() {
  const navigate = useNavigate()

  // Preloading
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const loadedImagesRef = useRef([])

  // Active frame & continuous scroll progress
  const frameIndexRef = useRef(0)
  const [frameIndex, setFrameIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  // ── Stage 4 Typewriter Animation ──────────────────────────────────────────
  const isStage4 = frameIndex >= 33
  const [typewriter, setTypewriter] = useState({ line1: '', line2: '', done: false })

  useEffect(() => {
    if (!isStage4) {
      setTypewriter({ line1: '', line2: '', done: false })
      return
    }

    let isCancelled = false
    let timerId = null
    const line1Full = 'Your Academic Command Center,'
    const line2Full = 'Unfolded.'
    let i = 0
    let j = 0

    const typeLine1 = () => {
      if (isCancelled) return
      i++
      setTypewriter(prev => ({ ...prev, line1: line1Full.slice(0, i) }))
      if (i < line1Full.length) {
        timerId = setTimeout(typeLine1, 35)
      } else {
        timerId = setTimeout(typeLine2, 180)
      }
    }

    const typeLine2 = () => {
      if (isCancelled) return
      j++
      const isDone = j >= line2Full.length
      setTypewriter(prev => ({
        ...prev,
        line2: line2Full.slice(0, j),
        done: isDone
      }))
      if (!isDone) {
        timerId = setTimeout(typeLine2, 45)
      }
    }

    timerId = setTimeout(typeLine1, 140)

    return () => {
      isCancelled = true
      if (timerId) clearTimeout(timerId)
    }
  }, [isStage4])

  // DOM Refs
  const canvasRef = useRef(null)
  const scrollZoneRef = useRef(null)
  const rafRef = useRef(null)

  // ── Progressive load on mount (Instant Frame 0 unlock) ────────────────────
  useEffect(() => {
    // Safety instant display timer: never block user for more than 200ms
    const safetyTimer = setTimeout(() => {
      setReady(true)
    }, 200)

    startProgressiveLoading(
      (imgs) => {
        loadedImagesRef.current = imgs
        clearTimeout(safetyTimer)
        setReady(true)
      },
      (p) => setLoadProgress(p),
      (imgs) => {
        loadedImagesRef.current = imgs
      }
    )

    return () => clearTimeout(safetyTimer)
  }, [])

  // ── High-performance Canvas Cover Drawing with nearest-frame fallback ──────
  const drawCoverFrame = useCallback((idx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Find target frame or closest loaded frame
    let img = loadedImagesRef.current[idx]
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let k = idx - 1; k >= 0; k--) {
        const c = loadedImagesRef.current[k]
        if (c && c.complete && c.naturalWidth > 0) {
          img = c
          break
        }
      }
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let k = idx + 1; k < TOTAL_FRAMES; k++) {
          const c = loadedImagesRef.current[k]
          if (c && c.complete && c.naturalWidth > 0) {
            img = c
            break
          }
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return


    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth || window.innerWidth
    const height = canvas.clientHeight || window.innerHeight

    const targetW = Math.round(width * dpr)
    const targetH = Math.round(height * dpr)

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
    }

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'medium'

    const imgRatio = img.naturalWidth / img.naturalHeight
    const canvasRatio = width / height
    let drawW, drawH, offX, offY

    if (canvasRatio > imgRatio) {
      drawW = width
      drawH = width / imgRatio
      offX = 0
      offY = (height - drawH) / 2
    } else {
      drawW = height * imgRatio
      drawH = height
      offX = (width - drawW) / 2
      offY = 0
    }

    ctx.drawImage(img, offX, offY, drawW, drawH)
    ctx.restore()
  }, [])

  // ── Scroll Scrubber with RAF ───────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const zone = scrollZoneRef.current
        if (!zone) return

        const rect = zone.getBoundingClientRect()
        const totalScrollLength = zone.offsetHeight - window.innerHeight
        if (totalScrollLength <= 0) return

        const currentScroll = Math.max(0, Math.min(totalScrollLength, -rect.top))
        const progress = currentScroll / totalScrollLength
        setScrollProgress(progress)

        const targetIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(progress * TOTAL_FRAMES)
        )

        if (targetIdx !== frameIndexRef.current) {
          frameIndexRef.current = targetIdx
          setFrameIndex(targetIdx)
        }

        drawCoverFrame(targetIdx)
      })
    }

    const onResize = () => {
      drawCoverFrame(frameIndexRef.current)
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToFrame(Math.min(TOTAL_FRAMES - 1, frameIndexRef.current + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToFrame(Math.max(0, frameIndexRef.current - 1))
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    drawCoverFrame(0)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [ready, drawCoverFrame])

  // ── Jump to frame helper ──────────────────────────────────────────────────
  const scrollToFrame = (targetIdx) => {
    const zone = scrollZoneRef.current
    if (!zone) return
    const totalScrollLength = zone.offsetHeight - window.innerHeight
    const zoneTop = zone.getBoundingClientRect().top + window.scrollY
    const targetScroll = zoneTop + (targetIdx / (TOTAL_FRAMES - 1)) * totalScrollLength
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  // ── Scrubber click handler ────────────────────────────────────────────────
  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    const targetIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(pct * TOTAL_FRAMES))
    scrollToFrame(targetIdx)
  }

  // ── Preloader (Instant reveal as soon as initial frame arrives) ────────────
  if (!ready) {
    return (
      <div className="ll-loader">
        <div className="ll-loader__content">
          <div className="ll-loader__logo">
            <span className="ll-nav__dot" />
            LOOMLEARN
          </div>
          <div className="ll-loader__bar-wrap">
            <div className="ll-loader__bar" style={{ width: `${Math.max(35, loadProgress * 100)}%` }} />
          </div>
          <p className="ll-loader__label">Loading LoomLearn…</p>
        </div>
      </div>
    )
  }

  // ── Stage 2 (Deep Focus) fast entry + extended center stay ────────────────
  // 1. Enters fast from right (+35vw -> 0vw within first ~12% of scroll)
  // 2. Stays locked in center (0vw) for the majority of the stage (screen time!)
  // 3. Gracefully departs to left right before Concurrency loads
  const stage2Progress = Math.max(0, Math.min(1, (scrollProgress - 0.15) / 0.44))
  let stage2TranslateX = 0
  if (stage2Progress < 0.12) {
    // Fast entry
    const t = stage2Progress / 0.12
    stage2TranslateX = 35 * (1 - t)
  } else if (stage2Progress <= 0.88) {
    // Extended stable dwell right in the center
    const t = (stage2Progress - 0.12) / (0.88 - 0.12)
    stage2TranslateX = 1 - t * 2
  } else {
    // Departs right before next text loads
    const t = (stage2Progress - 0.88) / (1 - 0.88)
    stage2TranslateX = -1 - t * 44
  }
  const isStage2Active = stage2Progress >= 0.10 && stage2Progress <= 0.90

  return (
    <div className="ll-landing">

      {/* ── Sticky Top Nav ──────────────────────────────────────────────── */}
      <nav className="ll-nav">
        <div className="ll-nav__brand" onClick={() => scrollToFrame(0)}>
          <span className="ll-nav__dot" />
          LOOMLEARN
        </div>

        <div className="ll-nav__links">
          {STAGES.map((s, idx) => (
            <button
              key={idx}
              className={`ll-nav__stage-btn${frameIndex >= s.frame && (idx === STAGES.length - 1 || frameIndex < STAGES[idx + 1].frame) ? ' ll-nav__stage-btn--active' : ''}`}
              onClick={() => scrollToFrame(s.targetFrame ?? s.frame)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="ll-nav__actions">
          <button className="ll-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="ll-btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          CINEMATIC SCROLL ZONE
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={scrollZoneRef} className="ll-scroll-zone">

        <div className="ll-frame-sticky">

          {/* ── HTML5 Canvas Sequence Renderer ──────────────────────────── */}
          <canvas ref={canvasRef} className="ll-scroll-canvas" />

          {/* ── Subtle Vignette ─────────────────────────────────────────── */}
          <div className="ll-frame-vignette" />

          {/* ── Spotlight Backdrop Dimmer (Dims background on last stage) ─── */}
          <div className={`ll-spotlight-dimmer${frameIndex >= 33 ? ' ll-spotlight-dimmer--active' : ''}`} />

          {/* ══════════════════════════════════════════════════════════════════
              STAGE 1 (Frames 0–6): Split Text directly on the frame
              Top-Left corner + Bottom-Right corner
          ══════════════════════════════════════════════════════════════════ */}
          {/* Top-Left Corner Text with glassmorphic outline directly on the title text */}
          <div className={`ll-direct-tl${frameIndex <= 6 ? ' ll-direct--visible' : ''}`}>
            <span className="ll-direct-eyebrow">✦ LOOMLEARN ACADEMIC PODS</span>
            <div className="ll-title-outline-wrap">
              <h1 className="ll-direct-title ll-text-glass-outline">
                <span className="ll-font-peer-learning">Peer Learning,</span><br />
                <span className="ll-font-engineered ll-text-glow-blue">Engineered for you</span>
              </h1>
            </div>
            <p className="ll-direct-sub">
              Connect with classmates who've aced your exact coursework.<br />
              Live 1-on-1 and small study cohorts with verified peer mentors.
            </p>
          </div>

          {/* Bottom-Right Corner Actions without any glass container */}
          <div className={`ll-direct-br${frameIndex <= 6 ? ' ll-direct--visible' : ''}`}>
            <div className="ll-live-pulse-badge">
              <span className="ll-pulse-circle" />
              <span>LIVE SESSIONS ENROLLING NOW</span>
            </div>
            <div className="ll-direct-actions">
              <button className="ll-btn-primary ll-btn-primary--lg" onClick={() => navigate('/register')}>
                Start Learning Free →
              </button>
              <button className="ll-btn-ghost ll-btn-ghost--lg" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              STAGE 2 (Frames 7–23): Deep Focus with Extended Screen Time & Dwell
              Directly on the floating zero-gravity matcha frame
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`ll-moving-marquee-wrap${frameIndex >= 7 && frameIndex <= 23 ? ' ll-direct--visible' : ''}`}
            style={{ transform: `translate3d(${stage2TranslateX}vw, -50%, 0)` }}
          >
            <div className="ll-moving-marquee-inner">
              <span className="ll-moving-badge">✦ ZERO-GRAVITY FOCUS</span>
              <div className="ll-moving-title-wrap">
                <h2 className={`ll-moving-title ll-moving-title--glass${isStage2Active ? ' ll-moving-title--active' : ''}`}>
                  Distractions float away. Pure conceptual clarity.
                </h2>
              </div>
              <p className="ll-moving-desc">
                Capped study cohorts • Active mentor Q&A • Zero clutter
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              STAGE 3 (Frames 24–32): iPhone-style Cursive Concurrency Animation
              Directly on the fluid transition wipe frame
          ══════════════════════════════════════════════════════════════════ */}
          <div className={`hello__div${frameIndex >= 24 && frameIndex <= 32 ? ' hello__div--active' : ''}`}>
            <div className="hello__svg-wrapper">
              <svg
                className="hello__svg"
                viewBox="0 0 940 290"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="appleConcurrencyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="65%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                {/* Apple cursive single continuous stroke "concurrency" write-on animation */}
                <path
                  className="hello__path"
                  pathLength="1"
                  stroke="url(#appleConcurrencyGrad)"
                  d="M 50,140 C 70,120 90,118 100,125 C 108,132 98,142 88,145 C 68,150 56,170 70,188 C 84,204 110,200 125,188 C 138,178 152,140 172,130 C 190,120 205,135 198,162 C 190,192 165,204 148,198 C 132,192 135,168 150,148 C 165,128 190,128 202,142 C 210,150 218,150 228,144 C 235,140 238,165 236,198 C 242,170 258,135 282,135 C 302,135 304,165 298,198 C 305,180 320,150 338,136 C 352,126 362,135 355,148 C 342,156 332,176 342,192 C 352,204 372,200 385,188 C 395,178 408,142 418,138 C 426,134 422,165 418,188 C 426,200 445,202 454,188 C 460,178 470,148 474,138 C 476,134 472,165 470,198 C 478,178 495,145 510,140 C 522,136 525,145 520,158 C 516,170 520,192 528,198 C 536,178 552,145 568,140 C 580,136 582,145 578,158 C 574,170 578,192 586,198 C 595,182 612,152 628,142 C 638,135 644,142 638,155 C 625,168 615,186 626,196 C 636,204 650,196 660,186 C 666,180 672,165 670,198 C 676,170 692,135 715,135 C 735,135 738,165 732,198 C 738,180 752,150 768,136 C 780,126 788,135 782,148 C 772,156 764,176 774,192 C 782,204 798,200 810,188 C 818,178 828,142 836,138 C 842,134 838,165 835,188 C 842,200 858,200 864,188 C 870,176 878,145 882,138 C 880,165 874,210 868,242 C 860,270 838,272 825,258 C 815,246 828,230 848,228 C 868,226 886,210 902,185"
                />
              </svg>
            </div>
            <div className="hello__subtitle-wrap">
              <span className="hello__tag">✦ ATOMIC REAL-TIME CONCURRENCY</span>
              <div className="ll-headline-outline-wrap">
                <h3 className="hello__headline ll-text-glass-outline">
                  Fluid transitions. Instant seat confirmation.
                </h3>
              </div>
              <p className="hello__body">Sub-millisecond transactional locks eliminate double-bookings.</p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              STAGE 4 (Frames 33–40): Spatial Holographic HUD with Spotlight
              Directly on the full-screen LoomLearn tablet dashboard
          ══════════════════════════════════════════════════════════════════ */}
          <div className={`ll-spatial-hud${frameIndex >= 33 ? ' ll-direct--visible' : ''}`}>

            {/* Theatrical Spotlight Cone & Glow behind the text */}
            <div className="ll-hud-spotlight-container">
              <div className="ll-spotlight-cone" />
              <div className="ll-spotlight-center-glow" />
            </div>

            {/* Glowing Category Pill */}
            <div className="ll-hud-pill">
              <span className="ll-hud-pill-dot" />
              <span>THE LOOMLEARN WORKSPACE</span>
            </div>

            {/* Main Spatial Title with Typewriter Animation (no glassmorphism) */}
            <div className="ll-hud-title-wrap">
              <h2 className="ll-hud-title">
                <span>{typewriter.line1}</span>
                {isStage4 && typewriter.line1.length < 'Your Academic Command Center,'.length && (
                  <span className="ll-typewriter-cursor">|</span>
                )}
                <br />
                <span className="ll-text-glow-cyan">{typewriter.line2}</span>
                {isStage4 && typewriter.line1.length >= 'Your Academic Command Center,'.length && (
                  <span className={`ll-typewriter-cursor ll-typewriter-cursor--cyan${typewriter.done ? ' ll-typewriter-cursor--blink' : ''}`}>|</span>
                )}
              </h2>
            </div>

            {/* Live Floating Platform Metrics */}
            <div className="ll-hud-metrics">
              <div className="ll-hud-metric-item">
                <span className="ll-hud-metric-val">2,400+</span>
                <span className="ll-hud-metric-lbl">Active Students</span>
              </div>
              <div className="ll-hud-metric-separator" />
              <div className="ll-hud-metric-item">
                <span className="ll-hud-metric-val">180+</span>
                <span className="ll-hud-metric-lbl">Verified Tutors</span>
              </div>
              <div className="ll-hud-metric-separator" />
              <div className="ll-hud-metric-item">
                <span className="ll-hud-metric-val">100%</span>
                <span className="ll-hud-metric-lbl">Guaranteed Seats</span>
              </div>
            </div>

            {/* Primary Action Buttons directly over dashboard */}
            <div className="ll-hud-actions">
              <button className="ll-btn-primary ll-btn-primary--lg" onClick={() => navigate('/register')}>
                Launch LoomLearn Dashboard →
              </button>
              <button className="ll-btn-ghost ll-btn-ghost--lg" onClick={() => navigate('/login')}>
                Sign In to Account
              </button>
            </div>
          </div>

        </div>{/* end ll-frame-sticky */}
      </div>{/* end ll-scroll-zone */}

    </div>
  )
}

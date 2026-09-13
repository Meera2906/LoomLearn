/**
 * Centralized Image Links & Placeholder Configuration
 * 
 * You can replace any placeholder link below with your own hosted image URLs
 * (e.g., from Cloudinary, Imgur, AWS S3, Supabase, Google Cloud Storage, etc.).
 */

// ============================================================================
// 1. LANDING PAGE SCROLL ANIMATION FRAMES (41 Frames)
// ============================================================================
// OPTION A: If you host all frames in a folder with matching names (frame_001.png ... frame_041.png),
// simply set FRAME_BASE_URL (e.g. 'https://your-cdn.com/Scroll_frames/').
// Leave it empty ('') if you want to use the individual URLs in LANDING_FRAME_LINKS below.
export const FRAME_BASE_URL = ''

// OPTION B: Replace the placeholder URLs below with your individual hosted image links.
export const LANDING_FRAME_LINKS = [
  // ── Stage 1: Overview (Frames 1 to 7) ──────────────────────────────────────
  /* Frame 001 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960959/frame_001_djxmz3.png',
  /* Frame 002 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960944/frame_002_wyptlj.png',
  /* Frame 003 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960659/frame_003_du3xjz.png',
  /* Frame 004 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960769/frame_004_csya94.png',
  /* Frame 005 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960849/frame_005_sazfva.png',
  /* Frame 006 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960825/frame_006_zm0ggl.png',
  /* Frame 007 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960841/frame_007_vxbyee.png',

  // ── Stage 2: Deep Focus / Floating Matcha (Frames 8 to 24) ────────────────
  /* Frame 008 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960846/frame_008_poq0lz.png',
  /* Frame 009 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960901/frame_009_qi0cwq.png',
  /* Frame 010 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960935/frame_010_zadkrw.png',
  /* Frame 011 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960963/frame_011_e5kyhy.png',
  /* Frame 012 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960937/frame_012_hzawwz.png',
  /* Frame 013 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959898/frame_013_x0malv.png',
  /* Frame 014 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959688/frame_014_lnj8ii.png',
  /* Frame 015 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959706/frame_015_jksggj.png',
  /* Frame 016 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959847/frame_016_ylskmj.png',
  /* Frame 017 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959819/frame_017_kjsg9t.png',
  /* Frame 018 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959840/frame_018_l4xkr4.png',
  /* Frame 019 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959801/frame_019_nhu9gd.png',
  /* Frame 020 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959896/frame_020_vemnxh.png',
  /* Frame 021 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959937/frame_021_dzv3ew.png',
  /* Frame 022 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960417/frame_022_u6osdj.png',
  /* Frame 023 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960450/frame_023_cekhlo.png',
  /* Frame 024 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960418/frame_024_b8avep.png',

  // ── Stage 3: Concurrency Fluid Wipe (Frames 25 to 33) ─────────────────────
  /* Frame 025 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960448/frame_025_pkr88n.png',
  /* Frame 026 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960451/frame_026_igsyen.png',
  /* Frame 027 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960375/frame_027_ri1yi2.png',
  /* Frame 028 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960442/frame_028_d1tgrd.png',
  /* Frame 029 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788960442/frame_028_d1tgrd.png',
  /* Frame 030 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959373/frame_030_lizgww.png',
  /* Frame 031 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959502/frame_031_cxiouj.png',
  /* Frame 032 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959519/frame_032_wyxgp4.png',
  /* Frame 033 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959496/frame_033_mudnkh.png',

  // ── Stage 4: Spatial Workspace HUD (Frames 34 to 41) ──────────────────────
  /* Frame 034 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959526/frame_034_ulwhey.png',
  /* Frame 035 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959494/frame_035_lenv3o.png',
  /* Frame 036 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959574/frame_036_tlje58.png',
  /* Frame 037 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959606/frame_037_tx8jfq.png',
  /* Frame 038 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959632/frame_038_cqtj2h.png',
  /* Frame 039 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959625/frame_039_ggpfl1.png',
  /* Frame 040 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959583/frame_040_ixkldi.png',
  /* Frame 041 */ 'https://res.cloudinary.com/dmvsskquk/image/upload/v1788959615/frame_041_lx5zvy.png',
]

/**
 * Helper to resolve the URL for a specific frame index (0 to 40).
 * If a local copy exists in /Scroll_frames/ or fallback is needed,
 * it returns the link with graceful fallback.
 */
export const getLandingFrameUrl = (index) => {
  if (FRAME_BASE_URL && FRAME_BASE_URL.trim() !== '') {
    const num = String(index + 1).padStart(3, '0')
    const base = FRAME_BASE_URL.replace(/\/+$/, '')
    return `${base}/frame_${num}.png`
  }
  if (LANDING_FRAME_LINKS[index] && LANDING_FRAME_LINKS[index].trim() !== '') {
    const url = LANDING_FRAME_LINKS[index]
    if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto:good,w_1600/')
    }
    return url
  }
  // Local fallback if no link configured
  const num = String(index + 1).padStart(3, '0')
  return `/Scroll_frames/frame_${num}.png`
}

export const getAllLandingFrameUrls = () => {
  return Array.from({ length: 41 }, (_, i) => getLandingFrameUrl(i))
}


// ============================================================================
// 2. SUBJECT THUMBNAIL PLACEHOLDER & CUSTOM LINKS
// ============================================================================
export const SUBJECT_IMAGE_LINKS = {
  English: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
  ComputerScience: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
  GenAI: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  Mathematics: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
  Physics: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
  Chemistry: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
  DataScience: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  UIUX: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
  ProductDesign: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
  Business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
  Default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
}


// ============================================================================
// 3. USER PROFILE PRESET AVATAR LINKS
// ============================================================================
export const PRESET_AVATAR_LINKS = [
  { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { label: 'Avatar 5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { label: 'Avatar 6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
]

// ============================================================================
// 4. PROFILE BACKGROUND IMAGES (LEARNER & MENTOR)
// ============================================================================
export const LEARNER_PROFILE_BG = 'https://res.cloudinary.com/dmvsskquk/image/upload/v1789302301/c2474bb5b0f1e49db7d8ca395ec06f1b_jd7fro.jpg'
export const MENTOR_PROFILE_BG = 'https://res.cloudinary.com/dmvsskquk/image/upload/v1789302301/72e884309875503675073180c47c2bb1_hrex23.jpg'

// ============================================================================
// 5. DASHBOARD WELCOME AVATAR
// ============================================================================
export const DASHBOARD_AVATAR_URL = 'https://res.cloudinary.com/dmvsskquk/image/upload/v1789303998/student-management-stepping-stones-to-success-experts-share-strategies-for-mastering-business-life-relationships-predictive-analytics-student-821c2dbf7c610c3c568f543a98d7f1bc_zhxzr4.png'




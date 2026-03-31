/* ==========================================
   タテドウガ - Individual Work Detail Page
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============ HEADER SCROLL ============
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============ HAMBURGER ============
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    const closeMenu = () => {
      hamburger.classList.remove('is-active');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('menu-open') &&
          !nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
    });
  }

  // ============ UTILITIES ============
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function extractYouTubeId(input) {
    if (!input) return '';
    input = input.trim();
    let m = input.match(/src=["']https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = input.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = input.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    return input;
  }

  // ============ DATA ============
  const KEYS = { works: 'td_works', categories: 'td_categories' };

  function getData(key) {
    return DB.get(key.replace('td_', ''));
  }

  const DEFAULT_CATEGORIES = {
    corporate: '企業VP', product: '商品紹介', recruit: '採用動画',
    sns: 'SNS広告', anime: 'アニメーション',
  };

  function getCategoryMap() {
    const stored = getData(KEYS.categories);
    if (stored && stored.length > 0) {
      const map = {};
      stored.forEach(c => { map[c.key] = c.label; });
      return map;
    }
    return DEFAULT_CATEGORIES;
  }

  const STATIC_WORKS = {
    'static-1': { id: 'static-1', title: '大手IT企業 会社紹介映像', category: 'corporate', videoId: 'oG0mrNqGZCw', duration: '0:19', description: '' },
    'static-2': { id: 'static-2', title: '化粧品ブランド 新商品プロモーション', category: 'product', videoId: 'oG0mrNqGZCw', duration: '1:30', description: '' },
    'static-3': { id: 'static-3', title: '大手メーカー 新卒採用リクルート映像', category: 'recruit', videoId: 'oG0mrNqGZCw', duration: '5:12', description: '' },
    'static-4': { id: 'static-4', title: 'アパレルブランド Instagram Reels広告', category: 'sns', videoId: 'oG0mrNqGZCw', duration: '0:30', description: '' },
    'static-5': { id: 'static-5', title: 'SaaS企業 サービス紹介モーショングラフィックス', category: 'anime', videoId: 'oG0mrNqGZCw', duration: '2:00', description: '' },
    'static-6': { id: 'static-6', title: '不動産デベロッパー ブランドムービー', category: 'corporate', videoId: 'oG0mrNqGZCw', duration: '4:15', description: '' },
  };

  function findWork(id) {
    const idStr = String(id);
    if (STATIC_WORKS[idStr]) return STATIC_WORKS[idStr];
    const works = getData(KEYS.works) || [];
    const numId = parseInt(idStr, 10);
    return works.find(w => String(w.id) === idStr || w.id === numId) || null;
  }

  function getAllWorks() {
    const stored = getData(KEYS.works) || [];
    return [...stored].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  }

  // ============ GET WORK ID FROM URL ============
  // URL: /works/123 → rewritten to work.html by Vercel
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const workId = pathParts[pathParts.length - 1];

  if (!workId || pathParts[0] !== 'works') {
    window.location.href = '/works.html';
    return;
  }

  // ============ SHOW ERROR ============
  function showError(msg) {
    document.getElementById('work-loading').innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <p style="color:#666;margin-bottom:24px;">${msg}</p>
        <a href="/works.html" style="color:#e50012;font-family:'Inter',sans-serif;font-size:0.85rem;letter-spacing:0.08em;">← 制作実績一覧に戻る</a>
      </div>
    `;
  }

  // ============ RENDER ============
  function renderWork(work) {
    const CATEGORIES = getCategoryMap();
    const vid = extractYouTubeId(work.videoId);
    const wCats = Array.isArray(work.categories) ? work.categories : (work.category ? [work.category] : []);

    // SEO: update title and meta tags
    const titleText = work.title + ' | 株式会社タテドウガ';
    const descText = work.description ? work.description.slice(0, 120) : ('AI動画制作実績：' + work.title);
    const thumbUrl = work.thumbnail || 'https://img.youtube.com/vi/' + vid + '/maxresdefault.jpg';
    const pageUrl = 'https://www.tatedouga.jp/works/' + work.id;

    document.title = titleText;
    const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
    setMeta('meta[name="description"]', descText);
    setMeta('meta[property="og:title"]', titleText);
    setMeta('meta[property="og:description"]', descText);
    setMeta('meta[property="og:image"]', thumbUrl);
    setMeta('meta[property="og:url"]', pageUrl);

    // Related works
    const allWorks = getAllWorks();
    let related = allWorks.filter(w => {
      if (String(w.id) === String(work.id)) return false;
      const wc = Array.isArray(w.categories) ? w.categories : (w.category ? [w.category] : []);
      return wc.some(c => wCats.includes(c));
    }).slice(0, 3);
    if (related.length < 3) {
      const relIds = new Set(related.map(r => String(r.id)));
      const fallback = allWorks
        .filter(w => String(w.id) !== String(work.id) && !relIds.has(String(w.id)))
        .slice(0, 3 - related.length);
      related = [...related, ...fallback];
    }

    const tagsHtml = wCats.map(c =>
      `<span class="work-detail-category">${escapeHtml(CATEGORIES[c] || c)}</span>`
    ).join('');

    const relatedHtml = related.length > 0 ? `
      <div class="work-detail-related">
        <div class="work-detail-related-title">RELATED WORKS</div>
        <div class="work-detail-related-grid">
          ${related.map(r => {
            const rv = extractYouTubeId(r.videoId);
            const rt = r.thumbnail || 'https://img.youtube.com/vi/' + rv + '/hqdefault.jpg';
            const rc = Array.isArray(r.categories) ? r.categories[0] : r.category;
            return `<a href="/works/${r.id}" class="work-detail-related-card">
              <div class="work-detail-related-thumb">
                <img src="${escapeHtml(rt)}" alt="${escapeHtml(r.title)}" loading="lazy">
              </div>
              <div class="work-detail-related-info">
                <span class="work-category-tag">${escapeHtml(CATEGORIES[rc] || rc || '')}</span>
                <h3 class="work-title">${escapeHtml(r.title)}</h3>
              </div>
            </a>`;
          }).join('')}
        </div>
      </div>
    ` : '';

    document.getElementById('work-content').innerHTML = `
      <a href="/works.html" class="work-page-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        制作実績一覧に戻る
      </a>

      <div class="work-page-video">
        <div class="work-page-video-wrap">
          <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(vid)}?rel=0&modestbranding=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>

      <div class="work-detail-meta">
        <div class="work-detail-tags">${tagsHtml}</div>
        <h1 class="work-detail-title">${escapeHtml(work.title)}</h1>
        <div class="work-detail-info-row">
          ${work.client ? `<span class="work-detail-info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${escapeHtml(work.client)}</span>` : ''}
          ${work.duration ? `<span class="work-detail-info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${escapeHtml(work.duration)}</span>` : ''}
        </div>
      </div>

      ${work.description ? `
      <div class="work-detail-section work-detail-description">
        <h2 class="work-detail-section-heading"><span class="heading-icon heading-icon--filled">■</span>説明文</h2>
        <p>${escapeHtml(work.description)}</p>
      </div>` : ''}

      ${work.points ? `
      <div class="work-detail-section work-detail-points">
        <h2 class="work-detail-section-heading"><span class="heading-icon heading-icon--filled">■</span>制作のポイント</h2>
        <div class="work-detail-points-body">${escapeHtml(work.points).replace(/\n/g, '<br>')}</div>
      </div>` : ''}

      ${relatedHtml}
    `;

    document.getElementById('work-loading').style.display = 'none';
    document.getElementById('work-content').style.display = 'block';
  }

  // ============ INIT ============
  DB.init()
    .then(() => {
      const work = findWork(workId);
      if (!work) {
        showError('作品が見つかりませんでした。');
        return;
      }
      renderWork(work);
    })
    .catch(() => {
      showError('読み込みに失敗しました。');
    });

});

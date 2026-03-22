/* ==========================================
   株式会社タテドウガ - Main JavaScript
   管理画面(localStorage)との連動対応
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============ AUTO DETECT SHORT VIDEOS ============
  function processShortVideos() {
    document.querySelectorAll('[data-video-type="short"]').forEach(card => {
      if (!card.classList.contains('work-card--short')) {
        card.classList.add('work-card--short');
      }
      const thumbnail = card.querySelector('.work-thumbnail');
      if (thumbnail && !thumbnail.querySelector('.work-short-badge')) {
        const badge = document.createElement('span');
        badge.className = 'work-short-badge';
        badge.textContent = 'Short';
        thumbnail.insertBefore(badge, thumbnail.firstChild);
      }
    });
  }
  processShortVideos();

  // ============ DATA LAYER (Firestore via DB) ============
  const KEYS = { works: 'td_works', news: 'td_news', inquiries: 'td_inquiries', settings: 'td_settings', categories: 'td_categories' };

  function getData(key) {
    if (key === KEYS.settings) return DB.getSettings();
    return DB.get(key.replace('td_', ''));
  }
  function getSettings() {
    return DB.getSettings();
  }

  const DEFAULT_CATEGORIES = {
    corporate: '企業VP', product: '商品紹介', recruit: '採用動画',
    sns: 'SNS広告', anime: 'アニメーション',
  };
  function getCategoryMap() {
    const stored = getData(KEYS.categories);
    if (stored.length > 0) {
      const map = {};
      stored.forEach(c => { map[c.key] = c.label; });
      return map;
    }
    return DEFAULT_CATEGORIES;
  }
  let CATEGORIES = getCategoryMap();


  // ============ LOAD WORKS FROM ADMIN ============
  function loadWorks() {
    // Refresh categories from localStorage
    CATEGORIES = getCategoryMap();

    // Dynamically generate filter buttons from categories
    const filterWrap = document.querySelector('.works-filter');
    if (filterWrap) {
      const cats = getData(KEYS.categories);
      if (cats.length > 0) {
        filterWrap.innerHTML = '<button class="filter-btn is-active" data-filter="all">ALL</button>'
          + cats.map(c => `<button class="filter-btn" data-filter="${c.key}">${escapeHtml(c.label)}</button>`).join('');
      }
    }

    const works = getData(KEYS.works);
    if (works.length === 0) return;

    const grid = document.querySelector('.works-grid');
    if (!grid) return;

    // Sort: within each category, pinned first (by sortOrder)
    const catOrder = getData(KEYS.categories).map(c => c.key);
    works.sort((a, b) => {
      const aCat = catOrder.indexOf(a.category);
      const bCat = catOrder.indexOf(b.category);
      const aCatIdx = aCat >= 0 ? aCat : 999;
      const bCatIdx = bCat >= 0 ? bCat : 999;
      if (aCatIdx !== bCatIdx) return aCatIdx - bCatIdx;
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      if (ap && bp) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return 0;
    });

    grid.innerHTML = works.map(w => {
      const vid = extractYouTubeId(w.videoId);
      const isShort = w.videoType === 'short';
      const shortClass = isShort ? 'work-card--short' : '';
      const wCats = Array.isArray(w.categories) ? w.categories : (w.category ? [w.category] : []);
      const tagsHtml = wCats.map(c => `<span class="work-category-tag">${escapeHtml(CATEGORIES[c] || c)}</span>`).join('');
      return `
      <div class="work-card ${shortClass} fade-in is-visible" data-category="${wCats[0] || ''}" data-categories="${wCats.join(',')}" data-work-id="${w.id}" data-video-type="${w.videoType || 'normal'}">
        <div class="work-video-wrap">
          <div class="work-thumbnail" data-video-id="${escapeAttr(vid)}">
            <img class="work-thumb-img" src="${w.thumbnail || 'https://img.youtube.com/vi/' + vid + '/hqdefault.jpg'}" alt="${escapeHtml(w.title)}">
            ${isShort ? '<span class="work-short-badge">Short</span>' : ''}
            ${w.duration ? `<span class="work-duration">${escapeHtml(w.duration)}</span>` : ''}
          </div>
        </div>
        <div class="work-info">
          <div class="work-tags">${tagsHtml}</div>
          <h3 class="work-title">${escapeHtml(w.title)}</h3>
          ${w.description ? `<p class="work-desc">${escapeHtml(w.description.length > 70 ? w.description.slice(0, 70) + '…' : w.description)}</p>` : ''}
          ${w.client ? `<p class="work-client">${escapeHtml(w.client)}</p>` : ''}
        </div>
      </div>
    `}).join('');

    bindWorkCards();
    bindWorksFilter();
  }

  // ============ LOAD NEWS FROM ADMIN ============
  function loadNews() {
    const news = getData(KEYS.news);
    if (news.length === 0) return;

    const list = document.querySelector('.news-list');
    if (!list) return;

    const tagClass = { '実績': 'tag-works', 'コラム': 'tag-column' };
    const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = sorted.map(n => {
      const dateFormatted = n.date.replace(/-/g, '.');
      return `
        <a href="#" class="news-item">
          <time>${dateFormatted}</time>
          <span class="news-tag ${tagClass[n.tag] || ''}">${escapeHtml(n.tag)}</span>
          <span class="news-text">${escapeHtml(n.title)}</span>
          <span class="news-arrow">&rarr;</span>
        </a>
      `;
    }).join('');

    list.classList.add('fade-in', 'is-visible');
  }

  // ============ LOAD SETTINGS FROM ADMIN ============
  function loadSettings() {
    const s = getSettings();
    if (Object.keys(s).length === 0) return;

    if (s.heroLine1) {
      const el = document.querySelector('.hero-title-line:not(.hero-title-accent)');
      if (el) el.textContent = s.heroLine1;
    }
    if (s.heroLine2) {
      const el = document.querySelector('.hero-title-accent');
      if (el) el.textContent = s.heroLine2;
    }
    if (s.heroDesc) {
      const el = document.querySelector('.hero-desc');
      if (el) el.innerHTML = s.heroDesc;
    }

    const aboutTable = document.querySelector('.about-table table');
    if (aboutTable) {
      const rows = aboutTable.querySelectorAll('tr');
      const map = {
        0: s.companyName, 1: s.founded, 2: s.ceo,
        3: s.address, 5: s.tel, 6: s.email,
      };
      for (const [idx, val] of Object.entries(map)) {
        if (val && rows[idx]) {
          rows[idx].querySelector('td').textContent = val;
        }
      }
    }

    if (s.tel) {
      const phoneEl = document.querySelector('.contact-phone-num');
      if (phoneEl) phoneEl.textContent = s.tel;
    }
  }

  // ============ CONTACT FORM → localStorage ============
  function bindContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const inquiries = getData(KEYS.inquiries);
      const maxId = inquiries.reduce((m, i) => Math.max(m, i.id || 0), 0);

      const now = new Date();
      const timestamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

      inquiries.push({
        id: maxId + 1,
        company: formData.get('company') || '',
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        tel: formData.get('tel') || '',
        type: formData.get('type') || '',
        message: formData.get('message') || '',
        timestamp,
      });

      DB.set('inquiries', inquiries);
      form.reset();

      const btn = form.querySelector('button[type="submit"]');
      const origText = btn.textContent;
      btn.textContent = '送信しました！';
      btn.style.background = '#22C55E';
      btn.style.borderColor = '#22C55E';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 3000);
    });
  }

  // ============ SCROLL ANIMATION ============
  function initScrollAnimation() {
    const fadeEls = document.querySelectorAll('.fade-in:not(.is-visible)');
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const parent = entry.target.parentElement;
        const siblings = Array.from(parent.children).filter(c => c.classList.contains('fade-in'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 120, 600);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        fadeObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  // ============ HEADER SCROLL ============
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ============ HAMBURGER MENU ============
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const closeMenu = () => {
    hamburger.classList.remove('is-active');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  hamburger.addEventListener('click', () => {
    const opening = !hamburger.classList.contains('is-active');
    hamburger.classList.toggle('is-active');
    nav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open');
    hamburger.setAttribute('aria-label', opening ? 'メニューを閉じる' : 'メニューを開く');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('menu-open') &&
        !nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });

  // ============ SMOOTH SCROLL ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============ COUNTER ANIMATION ============
  const counters = document.querySelectorAll('.hero-num-value');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const raw = el.textContent;
    const match = raw.match(/([\d,]+)/);
    if (!match) return;
    const numStr = match[1];
    const target = parseInt(numStr.replace(/,/g, ''), 10);
    const suffix = raw.slice(raw.indexOf(numStr) + numStr.length);
    const useComma = numStr.includes(',');
    const duration = 2200;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const val = Math.floor(eased * target);
      el.innerHTML = (useComma ? val.toLocaleString() : String(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  // ============ WORK DETAIL OVERLAY ============
  const overlay = document.getElementById('work-detail-overlay');
  const detailBody = document.getElementById('work-detail-body');
  const detailBack = document.getElementById('work-detail-back');

  // YouTube IFrame API (for quality control)
  let ytApiReady = false;
  let ytPlayer = null;
  (function loadYTApi() {
    if (window.YT && window.YT.Player) { ytApiReady = true; return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  })();
  window.onYouTubeIframeAPIReady = function() { ytApiReady = true; };

  function destroyYTPlayer() {
    if (ytPlayer) {
      try { ytPlayer.destroy(); } catch(e) {}
      ytPlayer = null;
    }
  }

  // Static card fallback data (for HTML-only cards before localStorage loads)
  const STATIC_WORKS = {
    'static-1': { id: 'static-1', title: '大手IT企業 会社紹介映像', category: 'corporate', client: '株式会社○○テクノロジー', videoId: 'oG0mrNqGZCw', duration: '0:19', description: '' },
    'static-2': { id: 'static-2', title: '化粧品ブランド 新商品プロモーション', category: 'product', client: '○○コスメティック株式会社', videoId: 'oG0mrNqGZCw', duration: '1:30', description: '' },
    'static-3': { id: 'static-3', title: '大手メーカー 新卒採用リクルート映像', category: 'recruit', client: '○○製造株式会社', videoId: 'oG0mrNqGZCw', duration: '5:12', description: '' },
    'static-4': { id: 'static-4', title: 'アパレルブランド Instagram Reels広告', category: 'sns', client: '○○ファッション株式会社', videoId: 'oG0mrNqGZCw', duration: '0:30', description: '' },
    'static-5': { id: 'static-5', title: 'SaaS企業 サービス紹介モーショングラフィックス', category: 'anime', client: '株式会社○○クラウド', videoId: 'oG0mrNqGZCw', duration: '2:00', description: '' },
    'static-6': { id: 'static-6', title: '不動産デベロッパー ブランドムービー', category: 'corporate', client: '○○不動産株式会社', videoId: 'oG0mrNqGZCw', duration: '4:15', description: '' },
  };

  function getAllWorks() {
    const stored = getData(KEYS.works);
    const list = stored.length > 0 ? stored : Object.values(STATIC_WORKS);
    const catOrder = getData(KEYS.categories).map(c => c.key);
    return [...list].sort((a, b) => {
      const aCatIdx = catOrder.indexOf(a.category) >= 0 ? catOrder.indexOf(a.category) : 999;
      const bCatIdx = catOrder.indexOf(b.category) >= 0 ? catOrder.indexOf(b.category) : 999;
      if (aCatIdx !== bCatIdx) return aCatIdx - bCatIdx;
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      if (ap && bp) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return 0;
    });
  }

  function findWork(workId) {
    const idStr = String(workId);
    // Check static first
    if (STATIC_WORKS[idStr]) return STATIC_WORKS[idStr];
    // Check localStorage
    const works = getData(KEYS.works);
    const numId = parseInt(idStr, 10);
    return works.find(w => String(w.id) === idStr || w.id === numId) || null;
  }

  function openWorkDetail(workId) {
    const work = findWork(workId);
    if (!work) return;
    openWorkDetailFromData(work);
  }

  function openWorkDetailFromData(work) {
    const vid = extractYouTubeId(work.videoId);
    const categoryLabel = CATEGORIES[work.category] || work.category;
    const allWorks = getAllWorks();
    const related = allWorks
      .filter(w => w.category === work.category && String(w.id) !== String(work.id))
      .slice(0, 3);

    let html = '';

    // Video (placeholder div for YT Player API)
    html += `<div class="work-detail-video">
      <div class="work-detail-video-wrap">
        <div id="yt-detail-player"></div>
      </div>
    </div>`;

    // Meta
    html += `<div class="work-detail-meta">
      <span class="work-detail-category">${escapeHtml(categoryLabel)}</span>
      <h1 class="work-detail-title">${escapeHtml(work.title)}</h1>
      <div class="work-detail-info-row">
        ${work.client ? `<span class="work-detail-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          ${escapeHtml(work.client)}</span>` : ''}
        ${work.duration ? `<span class="work-detail-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${escapeHtml(work.duration)}</span>` : ''}
      </div>
    </div>`;

    // Description
    if (work.description) {
      html += `<div class="work-detail-section work-detail-description">
        <h2 class="work-detail-section-heading"><span class="heading-icon heading-icon--filled">■</span>説明文</h2>
        <p>${escapeHtml(work.description)}</p>
      </div>`;
    }

    // Points
    if (work.points) {
      const pointsHtml = escapeHtml(work.points).replace(/\n/g, '<br>');
      html += `<div class="work-detail-section work-detail-points">
        <h2 class="work-detail-section-heading"><span class="heading-icon heading-icon--filled">■</span>制作のポイント</h2>
        <div class="work-detail-points-body">${pointsHtml}</div>
      </div>`;
    }

    // Related works
    if (related.length > 0) {
      html += `<div class="work-detail-related">
        <div class="work-detail-related-title">RELATED WORKS</div>
        <div class="work-detail-related-grid">
          ${related.map(r => {
            const rVid = extractYouTubeId(r.videoId);
            const rThumb = r.thumbnail || 'https://img.youtube.com/vi/' + rVid + '/hqdefault.jpg';
            return `<div class="work-detail-related-card" data-related-id="${r.id}">
              <div class="work-detail-related-thumb">
                <img src="${rThumb}" alt="${escapeHtml(r.title)}">
              </div>
              <div class="work-detail-related-info">
                <span class="work-category-tag">${CATEGORIES[r.category] || r.category}</span>
                <h3 class="work-title">${escapeHtml(r.title)}</h3>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    detailBody.innerHTML = html;
    overlay.classList.add('is-open');
    document.body.classList.add('work-detail-open');
    overlay.scrollTop = 0;

    // Initialize YT Player with 1080p quality
    destroyYTPlayer();
    function createPlayer() {
      ytPlayer = new YT.Player('yt-detail-player', {
        videoId: vid,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: function(e) {
            e.target.setPlaybackQuality('hd1080');
          },
          onPlaybackQualityChange: function(e) {
            if (e.data !== 'hd1080') {
              e.target.setPlaybackQuality('hd1080');
            }
          },
          onStateChange: function(e) {
            if (e.data === YT.PlayerState.PLAYING) {
              e.target.setPlaybackQuality('hd1080');
            }
          },
        },
      });
    }
    if (ytApiReady) {
      createPlayer();
    } else {
      // Wait for API to load
      const waitYT = setInterval(() => {
        if (ytApiReady) { clearInterval(waitYT); createPlayer(); }
      }, 100);
    }

    // Update hash without triggering popstate
    history.pushState({ workDetail: true, workId: String(work.id) }, '', '#work-' + work.id);

    // Bind related card clicks
    overlay.querySelectorAll('.work-detail-related-card').forEach(card => {
      card.addEventListener('click', () => {
        const relId = card.dataset.relatedId;
        if (relId) openWorkDetail(relId);
      });
    });
  }

  function closeWorkDetail() {
    // Destroy YT player to stop video
    destroyYTPlayer();
    const iframes = overlay.querySelectorAll('iframe');
    iframes.forEach(f => f.remove());

    overlay.classList.remove('is-open');
    document.body.classList.remove('work-detail-open');
    detailBody.innerHTML = '';

    // Clean hash
    if (location.hash.startsWith('#work-')) {
      history.pushState(null, '', location.pathname + location.search);
    }
  }

  // Back button
  if (detailBack) {
    detailBack.addEventListener('click', closeWorkDetail);
  }

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeWorkDetail();
    }
  });

  // Browser back button (popstate)
  window.addEventListener('popstate', () => {
    if (overlay.classList.contains('is-open')) {
      destroyYTPlayer();
      overlay.querySelectorAll('iframe').forEach(f => f.remove());
      overlay.classList.remove('is-open');
      document.body.classList.remove('work-detail-open');
      detailBody.innerHTML = '';
    } else if (location.hash.startsWith('#work-')) {
      const workId = location.hash.replace('#work-', '');
      openWorkDetail(workId);
    }
  });

  // Handle direct URL access with hash
  function checkHashOnLoad() {
    if (location.hash.startsWith('#work-')) {
      const workId = location.hash.replace('#work-', '');
      // Slight delay to ensure data is loaded
      setTimeout(() => openWorkDetail(workId), 100);
    }
  }

  // Bind work cards (replaces bindVideoPlayers)
  function bindWorkCards() {
    document.querySelectorAll('.work-card').forEach(card => {
      if (card.dataset.cardBound) return;
      card.dataset.cardBound = '1';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const workId = card.dataset.workId;
        if (workId) {
          openWorkDetail(workId);
        }
      });
    });
  }

  // ============ WORKS FILTER ============
  function bindWorksFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-card');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        workCards.forEach(card => {
          const cardCats = card.dataset.categories ? card.dataset.categories.split(',') : (card.dataset.category ? [card.dataset.category] : []);
          if (filter === 'all' || cardCats.includes(filter)) {
            card.style.display = '';
            card.classList.remove('is-visible');
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-visible')));
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ============ UTILITY ============
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
  function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function extractYouTubeId(input) {
    if (!input) return '';
    input = input.trim();
    // iframeコードから抽出
    let m = input.match(/src=["']https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtu.be 短縮URL
    m = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/watch?v=
    m = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/embed/
    m = input.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/shorts/
    m = input.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // 動画IDのみ(11文字)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    return input;
  }

  // ============ HERO ENTRANCE ANIMATION ============
  function initHeroAnimation() {
    document.querySelectorAll('.hero-anim').forEach(function(el) {
      var delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(function() {
        el.classList.add('is-visible');
      }, delay);
    });
  }

  // ============ PARTICLE TEXT ANIMATION ============
  function initParticleText() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    heroTitle.style.position = 'relative';

    const titleLines = heroTitle.querySelectorAll('.hero-title-line');

    titleLines.forEach((line, lineIndex) => {
      setTimeout(() => {
        // テキストの形状を取得
        const textPositions = getTextParticlePositions(line);
        const lineRect = line.getBoundingClientRect();
        const titleRect = heroTitle.getBoundingClientRect();

        const particles = [];

        // テキストの各ポイントに粒子を配置
        textPositions.forEach((pos, i) => {
          const particle = document.createElement('div');
          particle.className = 'particle';

          // テキスト内の最終位置（hero-title基準）
          const targetX = lineRect.left - titleRect.left + pos.x;
          const targetY = lineRect.top - titleRect.top + pos.y;

          // ランダムな開始位置（画面外から）
          const angle = Math.random() * Math.PI * 2;
          const distance = 400 + Math.random() * 300;
          const startX = Math.cos(angle) * distance;
          const startY = Math.sin(angle) * distance;

          particle.style.setProperty('--start-x', startX + 'px');
          particle.style.setProperty('--start-y', startY + 'px');
          particle.style.left = targetX + 'px';
          particle.style.top = targetY + 'px';
          particle.style.animationDelay = (Math.random() * 0.6) + 's';

          // 粒子のサイズにバリエーション
          const size = 3 + Math.random() * 3;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';

          heroTitle.appendChild(particle);
          particles.push(particle);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              particle.classList.add('active');
            });
          });
        });

        // 粒子形成後にテキストを表示
        setTimeout(() => {
          line.classList.add('text-formed');

          // さらに待ってから粒子を消す
          setTimeout(() => {
            particles.forEach(p => {
              if (p.parentNode) {
                p.style.animation = 'particleDissolve 0.8s ease forwards';
                setTimeout(() => p.remove(), 800);
              }
            });
          }, 500);
        }, 2000);

      }, lineIndex * 600 + 500);
    });
  }

  // テキストの形状に沿った粒子の位置を取得
  function getTextParticlePositions(element) {
    const text = element.textContent;
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const fontFamily = style.fontFamily;

    // Canvas でテキストを描画
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2; // 解像度

    canvas.width = element.offsetWidth * scale;
    canvas.height = element.offsetHeight * scale;

    ctx.font = `${fontWeight} ${fontSize * scale}px ${fontFamily}`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // ピクセルデータを取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const positions = [];
    const sampling = 5; // より細かいサンプリング

    // テキストが存在する位置を収集
    for (let y = 0; y < canvas.height; y += sampling) {
      for (let x = 0; x < canvas.width; x += sampling) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];

        // 不透明なピクセル（テキスト部分）
        if (alpha > 100) {
          positions.push({
            x: x / scale,
            y: y / scale
          });
        }
      }
    }

    // ランダムにシャッフルしてより多くの粒子を使用
    const shuffled = positions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(300, shuffled.length));
  }

  // ============ AI-STYLE TEXT ANIMATION ============
  function initAITextAnimation() {
    const titleLines = document.querySelectorAll('.hero-title-line');
    if (titleLines.length === 0) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    titleLines.forEach((line, lineIndex) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.opacity = '1';

      const charElements = [];

      // 各文字をspan要素に変換
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = text[i] === ' ' ? '\u00A0' : chars[Math.floor(Math.random() * chars.length)];
        span.dataset.finalChar = text[i];
        line.appendChild(span);
        charElements.push(span);
      }

      // 遅延後にアニメーション開始
      setTimeout(() => {
        charElements.forEach((charEl, charIndex) => {
          const finalChar = charEl.dataset.finalChar;
          let iterations = 0;
          const maxIterations = 5 + Math.floor(Math.random() * 5);

          const interval = setInterval(() => {
            if (iterations < maxIterations) {
              // ランダムな文字を表示
              if (finalChar !== ' ') {
                charEl.textContent = chars[Math.floor(Math.random() * chars.length)];
              }
              iterations++;
            } else {
              // 最終的な文字を表示
              charEl.textContent = finalChar === ' ' ? '\u00A0' : finalChar;
              charEl.classList.add('glitch');
              clearInterval(interval);
            }
          }, 50);

          // 文字を表示
          setTimeout(() => {
            charEl.style.animationDelay = '0s';
            charEl.style.opacity = '1';
          }, charIndex * 30 + lineIndex * 800);
        });
      }, 300);
    });
  }

  // ============ INIT ============
  DB.init()
    .then(() => {
      loadWorks();
      loadNews();
      loadSettings();
      bindContactForm();
      bindWorkCards();
      bindWorksFilter();
      initScrollAnimation();
      initHeroAnimation();
      initAITextAnimation();
      checkHashOnLoad();
    })
    .catch(e => {
      console.error('[Main] Firestore初期化失敗:', e);
      bindWorkCards();
      bindWorksFilter();
      initScrollAnimation();
      initHeroAnimation();
      initAITextAnimation();
      checkHashOnLoad();
    });

});

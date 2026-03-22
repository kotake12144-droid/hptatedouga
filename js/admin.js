/* ==========================================
   タテドウガ - Admin Panel JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============ DATA LAYER (Firestore via DB) ============
  const KEYS = {
    works: 'td_works',
    news: 'td_news',
    inquiries: 'td_inquiries',
    settings: 'td_settings',
    categories: 'td_categories',
  };

  // YouTube URL / iframe埋め込みコード → 動画ID抽出
  function extractYouTubeId(input) {
    if (!input) return '';
    input = input.trim();
    // <iframe>埋め込みコードから抽出
    let m = input.match(/src=["']https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtu.be/ID
    m = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/watch?v=ID
    m = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/embed/ID
    m = input.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // youtube.com/shorts/ID
    m = input.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // 11文字のIDそのまま
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    return input;
  }

  function getData(key) {
    if (key === KEYS.settings) return DB.getSettings();
    return DB.get(key.replace('td_', ''));
  }
  function setData(key, data) {
    if (key === KEYS.settings) DB.setSettings(data);
    else DB.set(key.replace('td_', ''), data);
  }
  function getSettings() {
    return DB.getSettings();
  }

  // Initialize with sample data if empty
  function initSampleData() {
    if (getData(KEYS.works).length === 0) {
      setData(KEYS.works, [
        { id: 1, title: '大手IT企業 会社紹介映像', category: 'corporate', client: '株式会社○○テクノロジー', videoId: 'oG0mrNqGZCw', duration: '3:24', description: 'AI生成映像と実写を組み合わせた、次世代のコーポレートムービー。最先端のAI技術を活用し、企業の魅力を余すことなく伝える映像に仕上げました。', points: '・AI生成映像と実写素材を自然に融合させるカラーグレーディング\n・企業理念を視覚的に表現するモーションデザイン\n・視聴者の離脱を防ぐテンポの良い構成設計' },
        { id: 2, title: '化粧品ブランド 新商品プロモーション', category: 'product', client: '○○コスメティック株式会社', videoId: 'oG0mrNqGZCw', duration: '1:30', description: 'AIによるビジュアル生成で、商品の世界観を美しく表現。短尺でもインパクトのあるプロモーション映像を実現しました。', points: '・AI生成による幻想的なビジュアル表現で商品の世界観を演出\n・短尺でも記憶に残るインパクトのある構成\n・各プラットフォーム最適化した複数バージョンの制作' },
        { id: 3, title: '大手メーカー 新卒採用リクルート映像', category: 'recruit', client: '○○製造株式会社', videoId: 'oG0mrNqGZCw', duration: '5:12', description: '働く社員の姿をAI生成映像で再現し、リアルな職場の雰囲気を伝えるリクルート映像。採用応募数の大幅増加に貢献しました。', points: '・AI生成映像で社員の日常業務風景をリアルに再現\n・若年層の心に響くBGMとテンポ感の設計\n・採用KPIを意識したCTA導線の組み込み' },
        { id: 4, title: 'アパレルブランド Instagram Reels広告', category: 'sns', client: '○○ファッション株式会社', videoId: 'oG0mrNqGZCw', duration: '0:30', description: 'AIで大量のクリエイティブバリエーションを生成し、ABテストを実施。CVR最大化を実現したSNS広告動画です。', points: '・AIによる大量クリエイティブバリエーション生成\n・ABテストに基づくデータドリブンな最適化\n・Reelsのアルゴリズムに最適化した冒頭3秒の設計' },
        { id: 5, title: 'SaaS企業 サービス紹介モーショングラフィックス', category: 'anime', client: '株式会社○○クラウド', videoId: 'oG0mrNqGZCw', duration: '2:00', description: 'AIモーショングラフィックスで複雑なサービス内容をわかりやすく可視化。サービスの価値を直感的に伝える映像に仕上げました。', points: '・AIモーショングラフィックスで複雑な機能を直感的に可視化\n・ユーザー目線のストーリーテリングで導入メリットを訴求\n・ブランドカラーとトーンを統一したデザインシステム' },
        { id: 6, title: '不動産デベロッパー ブランドムービー', category: 'corporate', client: '○○不動産株式会社', videoId: 'oG0mrNqGZCw', duration: '4:15', description: 'AI生成による壮大な建築ビジュアルと実写を組み合わせ、ブランドの世界観を表現。撮影ロケなしでもリッチな映像を実現しました。', points: '・AI生成による壮大な建築ビジュアルの制作\n・実写不要でコストを抑えつつリッチな映像を実現\n・ブランドの世界観を音楽と映像で統一的に演出' },
      ]);
    }
    if (getData(KEYS.news).length === 0) {
      setData(KEYS.news, [
        { id: 1, date: '2026-02-15', tag: 'お知らせ', title: 'コーポレートサイトをリニューアルしました' },
        { id: 2, date: '2026-02-01', tag: '実績', title: '大手食品メーカー様のAI活用プロモーション映像を制作しました' },
        { id: 3, date: '2026-01-20', tag: 'お知らせ', title: 'AI動画制作サービスを正式リリースしました' },
        { id: 4, date: '2026-01-10', tag: 'コラム', title: '2026年 AI動画マーケティングの最新トレンド' },
      ]);
    }
  }
  // ============ CATEGORY MAP (Firestore) ============
  const DEFAULT_CATEGORIES = [
    { key: 'corporate', label: '企業VP' },
    { key: 'product', label: '商品紹介' },
    { key: 'recruit', label: '採用動画' },
    { key: 'sns', label: 'SNS広告' },
    { key: 'anime', label: 'アニメーション' },
  ];

  function initCategories() {
    const stored = getData(KEYS.categories);
    if (stored.length === 0) {
      setData(KEYS.categories, DEFAULT_CATEGORIES);
    }
  }
  function getCategories() {
    const cats = getData(KEYS.categories);
    return cats.length > 0 ? cats : DEFAULT_CATEGORIES;
  }

  // Helper: key→label map (used in templates)
  function getCategoryMap() {
    const map = {};
    getCategories().forEach(c => { map[c.key] = c.label; });
    return map;
  }
  // Keep a reactive reference
  let CATEGORIES = getCategoryMap();

  // ============ SIDEBAR NAVIGATION ============
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  const panels = document.querySelectorAll('.panel');

  function showPanel(name) {
    panels.forEach(p => p.classList.remove('is-active'));
    sidebarLinks.forEach(l => l.classList.remove('is-active'));
    const panel = document.getElementById(`panel-${name}`);
    const link = document.querySelector(`.sidebar-link[data-section="${name}"]`);
    if (panel) panel.classList.add('is-active');
    if (link) link.classList.add('is-active');
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('is-open');
    document.getElementById('mobileMenuBtn').classList.remove('is-active');
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPanel(link.dataset.section);
    });
  });

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('is-active');
    sidebar.classList.toggle('is-open');
  });

  // ============ MODAL ============
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalSave = document.getElementById('modal-save');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');

  let currentModalCallback = null;

  function openModal(title, bodyHTML, onSave) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    currentModalCallback = onSave;
    modalOverlay.classList.add('is-open');
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    currentModalCallback = null;
  }

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalSave.addEventListener('click', () => {
    if (currentModalCallback) currentModalCallback();
  });

  // ============ TOAST ============
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const icon = type === 'success' ? '&#10003;' : '&#10007;';
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(12px)'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
  }

  // ============ RENDER: DASHBOARD ============
  function renderDashboard() {
    const works = getData(KEYS.works);
    const news = getData(KEYS.news);
    const inquiries = getData(KEYS.inquiries);

    document.getElementById('stat-works').textContent = works.length;
    document.getElementById('stat-news').textContent = news.length;
    document.getElementById('stat-inquiries').textContent = inquiries.length;

    // Recent inquiries
    const recentInq = document.getElementById('recent-inquiries');
    if (inquiries.length === 0) {
      recentInq.innerHTML = '<p class="empty-state">お問い合わせはまだありません</p>';
    } else {
      const recent = inquiries.slice(-5).reverse();
      recentInq.innerHTML = recent.map(i => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;">
          <div>
            <strong style="color:var(--white)">${escapeHtml(i.name)}</strong>
            <span style="color:var(--gray-500);margin-left:8px">${escapeHtml(i.company || '')}</span>
          </div>
          <span style="font-size:0.75rem;color:var(--gray-500)">${i.timestamp || ''}</span>
        </div>
      `).join('');
    }

    // Recent news
    const recentN = document.getElementById('recent-news');
    if (news.length === 0) {
      recentN.innerHTML = '<p class="empty-state">お知らせはまだありません</p>';
    } else {
      const recent = news.slice(-5).reverse();
      recentN.innerHTML = recent.map(n => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;">
          <span style="font-family:var(--font-en);font-size:0.75rem;color:var(--gray-500);flex-shrink:0">${n.date}</span>
          <span style="color:var(--gray-100)">${escapeHtml(n.title)}</span>
        </div>
      `).join('');
    }
  }

  // ============ SORT WORKS (by category group, pinned first within each) ============
  function getSortedWorks(works) {
    const catOrder = getCategories().map(c => c.key);
    return [...works].sort((a, b) => {
      // 1. Category group order
      const aCat = catOrder.indexOf(a.category);
      const bCat = catOrder.indexOf(b.category);
      const aCatIdx = aCat >= 0 ? aCat : 999;
      const bCatIdx = bCat >= 0 ? bCat : 999;
      if (aCatIdx !== bCatIdx) return aCatIdx - bCatIdx;
      // 2. Pinned first within same category
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      // 3. Sort by sortOrder among pinned
      if (aPinned && bPinned) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return 0;
    });
  }

  // Get pinned works within same category (for arrow enable/disable)
  function getPinnedInCategory(sorted, category) {
    return sorted.filter(w => w.pinned && w.category === category);
  }

  // ============ RENDER: WORKS ============
  function renderWorks() {
    const works = getData(KEYS.works);
    const tbody = document.getElementById('works-tbody');
    const empty = document.getElementById('works-empty');

    if (works.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    const sorted = getSortedWorks(works);
    let lastCategory = null;

    tbody.innerHTML = sorted.map((w, idx) => {
      const thumbSrc = w.thumbnail || (w.videoId ? `https://img.youtube.com/vi/${encodeURIComponent(w.videoId)}/mqdefault.jpg` : '');
      const isPinned = !!w.pinned;
      const catLabel = CATEGORIES[w.category] || w.category;

      // Category group header
      let catHeader = '';
      if (w.category !== lastCategory) {
        lastCategory = w.category;
        catHeader = `<tr><td colspan="7" style="padding:14px 16px 6px;font-size:0.75rem;font-weight:600;color:var(--red);letter-spacing:0.08em;border-bottom:1px solid rgba(229,0,18,0.15);background:rgba(229,0,18,0.02);">${escapeHtml(catLabel)}</td></tr>`;
      }

      // Pin up/down within category
      const pinnedInCat = getPinnedInCategory(sorted, w.category);
      const pinnedIdx = pinnedInCat.findIndex(p => p.id === w.id);
      const isFirstPinned = pinnedIdx === 0;
      const isLastPinned = pinnedIdx === pinnedInCat.length - 1;

      const row = `
      <tr style="${isPinned ? 'background:rgba(229,0,18,0.04);' : ''}">
        <td style="text-align:center">
          ${isPinned
            ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                <button class="table-btn-pin is-pinned" onclick="adminApp.unpinWork(${w.id})" title="固定を解除">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" stroke-width="2"><path d="M12 2l2.09 6.26L21 9.27l-5 3.89L17.18 20 12 16.77 6.82 20 8 13.16l-5-3.89 6.91-1.01z"/></svg>
                </button>
                <div style="display:flex;gap:1px;">
                  <button class="table-btn-arrow${isFirstPinned ? ' is-disabled' : ''}" onclick="adminApp.moveWork(${w.id},'up')" title="上へ"${isFirstPinned ? ' disabled' : ''}>&#9650;</button>
                  <button class="table-btn-arrow${isLastPinned ? ' is-disabled' : ''}" onclick="adminApp.moveWork(${w.id},'down')" title="下へ"${isLastPinned ? ' disabled' : ''}>&#9660;</button>
                </div>
              </div>`
            : `<button class="table-btn-pin" onclick="adminApp.pinWork(${w.id})" title="このジャンル内で上に固定">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" stroke-width="2"><path d="M12 2l2.09 6.26L21 9.27l-5 3.89L17.18 20 12 16.77 6.82 20 8 13.16l-5-3.89 6.91-1.01z"/></svg>
              </button>`
          }
        </td>
        <td>
          <div class="table-thumb">
            ${thumbSrc ? `<img src="${thumbSrc}" alt="">` : 'No image'}
          </div>
        </td>
        <td><strong style="color:var(--white)">${escapeHtml(w.title)}</strong></td>
        <td>${catLabel}</td>
        <td>${escapeHtml(w.client)}</td>
        <td><code style="font-size:0.75rem;color:var(--gray-500)">${escapeHtml(w.videoId)}</code></td>
        <td>
          <div class="table-actions">
            <button class="table-btn" onclick="adminApp.editWork(${w.id})">編集</button>
            <button class="table-btn table-btn-danger" onclick="adminApp.deleteWork(${w.id})">削除</button>
          </div>
        </td>
      </tr>`;
      return catHeader + row;
    }).join('');
  }

  // ============ RENDER: NEWS ============
  function renderNews() {
    const news = getData(KEYS.news);
    const tbody = document.getElementById('news-tbody');
    const empty = document.getElementById('news-empty');

    if (news.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    const tagClass = { 'お知らせ': 'tag-news', '実績': 'tag-works', 'コラム': 'tag-column' };

    tbody.innerHTML = news.map(n => `
      <tr>
        <td style="font-family:var(--font-en);white-space:nowrap">${n.date}</td>
        <td><span class="tag-badge ${tagClass[n.tag] || 'tag-news'}">${escapeHtml(n.tag)}</span></td>
        <td><strong style="color:var(--white)">${escapeHtml(n.title)}</strong></td>
        <td>
          <div class="table-actions">
            <button class="table-btn" onclick="adminApp.editNews(${n.id})">編集</button>
            <button class="table-btn table-btn-danger" onclick="adminApp.deleteNews(${n.id})">削除</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ============ RENDER: INQUIRIES ============
  function renderInquiries() {
    const inquiries = getData(KEYS.inquiries);
    const tbody = document.getElementById('inquiries-tbody');
    const empty = document.getElementById('inquiries-empty');

    if (inquiries.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = inquiries.slice().reverse().map(i => `
      <tr>
        <td style="font-size:0.78rem;white-space:nowrap">${i.timestamp || '-'}</td>
        <td>${escapeHtml(i.company || '-')}</td>
        <td><strong style="color:var(--white)">${escapeHtml(i.name)}</strong></td>
        <td style="font-size:0.78rem">${escapeHtml(i.email)}</td>
        <td>${escapeHtml(i.type || '-')}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn table-btn-view" onclick="adminApp.viewInquiry(${i.id})">詳細</button>
            <button class="table-btn table-btn-danger" onclick="adminApp.deleteInquiry(${i.id})">削除</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ============ RENDER: SETTINGS ============
  function renderSettings() {
    const s = getSettings();
    document.getElementById('setting-hero-line1').value = s.heroLine1 || '';
    document.getElementById('setting-hero-line2').value = s.heroLine2 || '';
    document.getElementById('setting-hero-desc').value = s.heroDesc || '';
    document.getElementById('setting-company-name').value = s.companyName || '';
    document.getElementById('setting-founded').value = s.founded || '';
    document.getElementById('setting-ceo').value = s.ceo || '';
    document.getElementById('setting-address').value = s.address || '';
    document.getElementById('setting-tel').value = s.tel || '';
    document.getElementById('setting-email').value = s.email || '';
    document.getElementById('setting-youtube').value = s.youtube || '';
    document.getElementById('setting-instagram').value = s.instagram || '';
    document.getElementById('setting-twitter').value = s.twitter || '';
  }

  // ============ RENDER: CATEGORIES ============
  function renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;
    const cats = getCategories();
    if (cats.length === 0) {
      container.innerHTML = '<p class="empty-state" style="padding:24px">カテゴリがありません</p>';
      return;
    }
    container.innerHTML = cats.map((c, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);">
        <div style="display:flex;flex-direction:column;gap:1px;flex-shrink:0;">
          <button class="table-btn-arrow${i === 0 ? ' is-disabled' : ''}" onclick="adminApp.moveCategory(${i},'up')" title="上へ"${i === 0 ? ' disabled' : ''}>&#9650;</button>
          <button class="table-btn-arrow${i === cats.length - 1 ? ' is-disabled' : ''}" onclick="adminApp.moveCategory(${i},'down')" title="下へ"${i === cats.length - 1 ? ' disabled' : ''}>&#9660;</button>
        </div>
        <code style="font-family:var(--font-en);font-size:0.75rem;color:var(--gray-500);min-width:100px">${escapeHtml(c.key)}</code>
        <span style="flex:1;font-size:0.9rem;color:var(--white)">${escapeHtml(c.label)}</span>
        <div class="table-actions">
          <button class="table-btn" onclick="adminApp.editCategory(${i})">編集</button>
          <button class="table-btn table-btn-danger" onclick="adminApp.deleteCategory(${i})">削除</button>
        </div>
      </div>
    `).join('');
  }

  // ============ WORKS CRUD ============
  function workFormHTML(data = {}) {
    const cats = Object.entries(CATEGORIES).map(([k, v]) =>
      `<option value="${k}" ${data.category === k ? 'selected' : ''}>${v}</option>`
    ).join('');
    const currentThumb = data.thumbnail || '';
    return `
      <div class="form-group">
        <label>サムネイル画像</label>
        <div id="modal-work-thumb-preview" style="margin-bottom:12px;border-radius:6px;overflow:hidden;aspect-ratio:16/9;background:var(--bg-input);display:flex;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,0.1);">
          ${currentThumb
            ? `<img src="${currentThumb}" style="width:100%;height:100%;object-fit:cover;" id="thumb-preview-img">`
            : `<span style="color:var(--gray-500);font-size:0.8rem" id="thumb-preview-text">画像をアップロードまたはURLを入力</span>`
          }
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <label style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:0.8rem;color:var(--gray-300);transition:all 0.2s" onmouseover="this.style.borderColor='var(--red)'" onmouseout="this.style.borderColor='var(--border)'">
            <input type="file" accept="image/*" id="modal-work-thumb-file" style="display:none">
            画像をアップロード
          </label>
          <button type="button" id="modal-work-thumb-clear" style="padding:10px 16px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:0.8rem;color:var(--gray-500)">クリア</button>
        </div>
        <input type="text" class="form-input" id="modal-work-thumb-url" value="${escapeHtml(currentThumb)}" placeholder="または画像URLを直接入力">
        <p style="font-size:0.7rem;color:var(--gray-500);margin-top:4px">未設定の場合はYouTubeサムネイルが使用されます</p>
      </div>
      <div class="form-group">
        <label>タイトル *</label>
        <input type="text" class="form-input" id="modal-work-title" value="${escapeHtml(data.title || '')}" placeholder="大手IT企業 会社紹介映像">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>カテゴリ *</label>
          <select class="form-input" id="modal-work-category">${cats}</select>
        </div>
        <div class="form-group">
          <label>再生時間</label>
          <input type="text" class="form-input" id="modal-work-duration" value="${escapeHtml(data.duration || '')}" placeholder="3:24">
        </div>
      </div>
      <div class="form-group">
        <label>クライアント名</label>
        <input type="text" class="form-input" id="modal-work-client" value="${escapeHtml(data.client || '')}" placeholder="株式会社○○">
      </div>
      <div class="form-group">
        <label>YouTube リンク *</label>
        <input type="text" class="form-input" id="modal-work-videoid" value="${escapeHtml(data.videoId || '')}" placeholder="例: https://youtu.be/oG0mrNqGZCw">
        <p style="font-size:0.75rem;color:var(--gray-500);margin-top:6px">YouTubeのURL（youtu.be/〜 や youtube.com/watch?v=〜）をそのまま貼り付けてください</p>
      </div>
      <div class="form-group">
        <label>■ 説明文</label>
        <textarea class="form-input" id="modal-work-description" rows="4" placeholder="制作実績の詳細説明（詳細ページに表示されます）">${escapeHtml(data.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>■ 制作のポイント</label>
        <textarea class="form-input" id="modal-work-points" rows="4" placeholder="制作で工夫した点やこだわりのポイント（改行で箇条書き）">${escapeHtml(data.points || '')}</textarea>
      </div>
      ${data.videoId ? `<div style="margin-top:8px;border-radius:6px;overflow:hidden;aspect-ratio:16/9"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${encodeURIComponent(data.videoId)}" frameborder="0" allowfullscreen></iframe></div>` : ''}
    `;
  }

  // Bind thumbnail upload/preview events after modal opens
  function bindThumbEvents() {
    const fileInput = document.getElementById('modal-work-thumb-file');
    const urlInput = document.getElementById('modal-work-thumb-url');
    const preview = document.getElementById('modal-work-thumb-preview');
    const clearBtn = document.getElementById('modal-work-thumb-clear');
    if (!fileInput) return;

    function setPreview(src) {
      if (src) {
        preview.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;" id="thumb-preview-img">';
      } else {
        preview.innerHTML = '<span style="color:var(--gray-500);font-size:0.8rem">画像をアップロードまたはURLを入力</span>';
      }
    }

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        urlInput.value = e.target.result;
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      setPreview(val || '');
    });

    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      fileInput.value = '';
      setPreview('');
    });
  }

  document.getElementById('btn-add-work').addEventListener('click', () => {
    openModal('制作実績を追加', workFormHTML(), () => {
      const title = document.getElementById('modal-work-title').value.trim();
      const rawVideoInput = document.getElementById('modal-work-videoid').value.trim();
      const videoId = extractYouTubeId(rawVideoInput);
      if (!title || !videoId) { showToast('タイトルとYouTubeリンクは必須です', 'error'); return; }
      const thumbnail = document.getElementById('modal-work-thumb-url').value.trim();
      const works = getData(KEYS.works);
      const maxId = works.reduce((m, w) => Math.max(m, w.id), 0);
      works.push({
        id: maxId + 1,
        title,
        category: document.getElementById('modal-work-category').value,
        client: document.getElementById('modal-work-client').value.trim(),
        videoId,
        duration: document.getElementById('modal-work-duration').value.trim(),
        thumbnail,
        description: document.getElementById('modal-work-description').value.trim(),
        points: document.getElementById('modal-work-points').value.trim(),
      });
      setData(KEYS.works, works);
      closeModal();
      renderAll();
      showToast('制作実績を追加しました');
    });
    bindThumbEvents();
  });

  // ============ NEWS CRUD ============
  function newsFormHTML(data = {}) {
    const tags = ['お知らせ', '実績', 'コラム'];
    const tagOpts = tags.map(t => `<option ${data.tag === t ? 'selected' : ''}>${t}</option>`).join('');
    return `
      <div class="form-row">
        <div class="form-group">
          <label>日付 *</label>
          <input type="date" class="form-input" id="modal-news-date" value="${data.date || new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>タグ *</label>
          <select class="form-input" id="modal-news-tag">${tagOpts}</select>
        </div>
      </div>
      <div class="form-group">
        <label>タイトル *</label>
        <input type="text" class="form-input" id="modal-news-title" value="${escapeHtml(data.title || '')}" placeholder="お知らせのタイトル">
      </div>
    `;
  }

  document.getElementById('btn-add-news').addEventListener('click', () => {
    openModal('お知らせを追加', newsFormHTML(), () => {
      const title = document.getElementById('modal-news-title').value.trim();
      const date = document.getElementById('modal-news-date').value;
      if (!title || !date) { showToast('日付とタイトルは必須です', 'error'); return; }
      const news = getData(KEYS.news);
      const maxId = news.reduce((m, n) => Math.max(m, n.id), 0);
      news.push({
        id: maxId + 1,
        date,
        tag: document.getElementById('modal-news-tag').value,
        title,
      });
      setData(KEYS.news, news);
      closeModal();
      renderAll();
      showToast('お知らせを追加しました');
    });
  });

  // ============ SETTINGS SAVE ============
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    const settings = {
      heroLine1: document.getElementById('setting-hero-line1').value,
      heroLine2: document.getElementById('setting-hero-line2').value,
      heroDesc: document.getElementById('setting-hero-desc').value,
      companyName: document.getElementById('setting-company-name').value,
      founded: document.getElementById('setting-founded').value,
      ceo: document.getElementById('setting-ceo').value,
      address: document.getElementById('setting-address').value,
      tel: document.getElementById('setting-tel').value,
      email: document.getElementById('setting-email').value,
      youtube: document.getElementById('setting-youtube').value,
      instagram: document.getElementById('setting-instagram').value,
      twitter: document.getElementById('setting-twitter').value,
    };
    setData(KEYS.settings, settings);
    showToast('設定を保存しました');
    const status = document.getElementById('save-status');
    status.textContent = '保存しました';
    status.classList.add('is-visible');
    setTimeout(() => status.classList.remove('is-visible'), 2000);
  });

  // ============ GLOBAL API for inline handlers ============
  window.adminApp = {
    editWork(id) {
      const works = getData(KEYS.works);
      const work = works.find(w => w.id === id);
      if (!work) return;
      openModal('制作実績を編集', workFormHTML(work), () => {
        work.title = document.getElementById('modal-work-title').value.trim();
        work.category = document.getElementById('modal-work-category').value;
        work.client = document.getElementById('modal-work-client').value.trim();
        work.videoId = extractYouTubeId(document.getElementById('modal-work-videoid').value.trim());
        work.duration = document.getElementById('modal-work-duration').value.trim();
        work.thumbnail = document.getElementById('modal-work-thumb-url').value.trim();
        work.description = document.getElementById('modal-work-description').value.trim();
        work.points = document.getElementById('modal-work-points').value.trim();
        if (!work.title || !work.videoId) { showToast('タイトルとYouTube動画IDは必須です', 'error'); return; }
        setData(KEYS.works, works);
        closeModal();
        renderAll();
        showToast('制作実績を更新しました');
      });
      bindThumbEvents();
    },

    deleteWork(id) {
      if (!confirm('この制作実績を削除しますか？')) return;
      const works = getData(KEYS.works).filter(w => w.id !== id);
      setData(KEYS.works, works);
      renderAll();
      showToast('制作実績を削除しました');
    },

    pinWork(id) {
      const works = getData(KEYS.works);
      const work = works.find(w => w.id === id);
      if (!work) return;
      // Find max sortOrder among pinned IN SAME CATEGORY
      const maxOrder = works.filter(w => w.pinned && w.category === work.category).reduce((m, w) => Math.max(m, w.sortOrder || 0), 0);
      work.pinned = true;
      work.sortOrder = maxOrder + 1;
      setData(KEYS.works, works);
      renderAll();
      showToast(`「${CATEGORIES[work.category] || work.category}」内で上に固定しました`);
    },

    unpinWork(id) {
      const works = getData(KEYS.works);
      const work = works.find(w => w.id === id);
      if (!work) return;
      work.pinned = false;
      work.sortOrder = 0;
      setData(KEYS.works, works);
      renderAll();
      showToast('固定を解除しました');
    },

    moveWork(id, direction) {
      const works = getData(KEYS.works);
      const work = works.find(w => w.id === id);
      if (!work) return;
      // Only move within same category's pinned items
      const sorted = getSortedWorks(works);
      const pinnedInCat = sorted.filter(w => w.pinned && w.category === work.category);
      const idx = pinnedInCat.findIndex(w => w.id === id);
      if (idx < 0) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= pinnedInCat.length) return;
      const a = works.find(w => w.id === pinnedInCat[idx].id);
      const b = works.find(w => w.id === pinnedInCat[swapIdx].id);
      const tmp = a.sortOrder;
      a.sortOrder = b.sortOrder;
      b.sortOrder = tmp;
      setData(KEYS.works, works);
      renderAll();
    },

    editNews(id) {
      const news = getData(KEYS.news);
      const item = news.find(n => n.id === id);
      if (!item) return;
      openModal('お知らせを編集', newsFormHTML(item), () => {
        item.date = document.getElementById('modal-news-date').value;
        item.tag = document.getElementById('modal-news-tag').value;
        item.title = document.getElementById('modal-news-title').value.trim();
        if (!item.title || !item.date) { showToast('日付とタイトルは必須です', 'error'); return; }
        setData(KEYS.news, news);
        closeModal();
        renderAll();
        showToast('お知らせを更新しました');
      });
    },

    deleteNews(id) {
      if (!confirm('このお知らせを削除しますか？')) return;
      const news = getData(KEYS.news).filter(n => n.id !== id);
      setData(KEYS.news, news);
      renderAll();
      showToast('お知らせを削除しました');
    },

    viewInquiry(id) {
      const inquiries = getData(KEYS.inquiries);
      const item = inquiries.find(i => i.id === id);
      if (!item) return;
      const html = `
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">日時</span><span class="detail-value">${item.timestamp || '-'}</span></div>
          <div class="detail-row"><span class="detail-label">会社名</span><span class="detail-value">${escapeHtml(item.company || '-')}</span></div>
          <div class="detail-row"><span class="detail-label">お名前</span><span class="detail-value">${escapeHtml(item.name)}</span></div>
          <div class="detail-row"><span class="detail-label">メール</span><span class="detail-value">${escapeHtml(item.email)}</span></div>
          <div class="detail-row"><span class="detail-label">電話番号</span><span class="detail-value">${escapeHtml(item.tel || '-')}</span></div>
          <div class="detail-row"><span class="detail-label">種別</span><span class="detail-value">${escapeHtml(item.type || '-')}</span></div>
          <div class="detail-row"><span class="detail-label">内容</span><span class="detail-value">${escapeHtml(item.message || '-')}</span></div>
        </div>
      `;
      openModal('お問い合わせ詳細', html, closeModal);
      modalSave.textContent = '閉じる';
      document.querySelector('.modal-footer .btn-ghost').style.display = 'none';
    },

    deleteInquiry(id) {
      if (!confirm('このお問い合わせを削除しますか？')) return;
      const inquiries = getData(KEYS.inquiries).filter(i => i.id !== id);
      setData(KEYS.inquiries, inquiries);
      renderAll();
      showToast('お問い合わせを削除しました');
    },

    // ---- Category CRUD ----
    addCategory() {
      const html = `
        <div class="form-group">
          <label>キー（英数字、ハイフン可） *</label>
          <input type="text" class="form-input" id="modal-cat-key" placeholder="例: corporate">
          <p style="font-size:0.7rem;color:var(--gray-500);margin-top:4px">フィルタ・データ用の内部キー（変更しづらいので慎重に）</p>
        </div>
        <div class="form-group">
          <label>表示名 *</label>
          <input type="text" class="form-input" id="modal-cat-label" placeholder="例: 企業VP">
        </div>
      `;
      openModal('カテゴリを追加', html, () => {
        const key = document.getElementById('modal-cat-key').value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
        const label = document.getElementById('modal-cat-label').value.trim();
        if (!key || !label) { showToast('キーと表示名は必須です', 'error'); return; }
        const cats = getCategories();
        if (cats.some(c => c.key === key)) { showToast('このキーは既に存在します', 'error'); return; }
        cats.push({ key, label });
        setData(KEYS.categories, cats);
        closeModal();
        renderAll();
        showToast('カテゴリを追加しました');
      });
    },

    editCategory(idx) {
      const cats = getCategories();
      const cat = cats[idx];
      if (!cat) return;
      const html = `
        <div class="form-group">
          <label>キー</label>
          <input type="text" class="form-input" id="modal-cat-key" value="${escapeHtml(cat.key)}" disabled style="opacity:0.5">
          <p style="font-size:0.7rem;color:var(--gray-500);margin-top:4px">キーは変更できません</p>
        </div>
        <div class="form-group">
          <label>表示名 *</label>
          <input type="text" class="form-input" id="modal-cat-label" value="${escapeHtml(cat.label)}">
        </div>
      `;
      openModal('カテゴリを編集', html, () => {
        const label = document.getElementById('modal-cat-label').value.trim();
        if (!label) { showToast('表示名は必須です', 'error'); return; }
        cats[idx].label = label;
        setData(KEYS.categories, cats);
        closeModal();
        renderAll();
        showToast('カテゴリを更新しました');
      });
    },

    deleteCategory(idx) {
      const cats = getCategories();
      const cat = cats[idx];
      if (!cat) return;
      const works = getData(KEYS.works);
      const used = works.filter(w => w.category === cat.key).length;
      const msg = used > 0
        ? `「${cat.label}」は${used}件の実績で使用中です。削除しますか？`
        : `「${cat.label}」を削除しますか？`;
      if (!confirm(msg)) return;
      cats.splice(idx, 1);
      setData(KEYS.categories, cats);
      renderAll();
      showToast('カテゴリを削除しました');
    },

    moveCategory(idx, direction) {
      const cats = getCategories();
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= cats.length) return;
      const tmp = cats[idx];
      cats[idx] = cats[swapIdx];
      cats[swapIdx] = tmp;
      setData(KEYS.categories, cats);
      renderAll();
    },
  };

  // Reset modal footer state on close
  const origModalClose = closeModal;
  function closeModalReset() {
    origModalClose();
    modalSave.textContent = '保存';
    document.querySelector('.modal-footer .btn-ghost').style.display = '';
  }
  // Override
  modalClose.removeEventListener('click', closeModal);
  modalCancel.removeEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModalReset);
  modalCancel.addEventListener('click', closeModalReset);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModalReset();
  });

  // ============ UTILITY ============
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============ DATA EXPORT / IMPORT ============
  const btnExport = document.getElementById('btn-export-data');
  const btnImport = document.getElementById('btn-import-data');
  const fileInput = document.getElementById('file-import-data');

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const data = {
        works: DB.get('works'),
        news: DB.get('news'),
        categories: DB.get('categories'),
        settings: DB.getSettings()
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tatedouga-data-' + new Date().toISOString().split('T')[0] + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('データをエクスポートしました', 'success');
    });
  }

  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.works) DB.set('works', data.works);
          if (data.news) DB.set('news', data.news);
          if (data.categories) DB.set('categories', data.categories);
          if (data.settings) DB.setSettings(data.settings);
          showToast('データをインポートしました', 'success');
          setTimeout(() => location.reload(), 1000);
        } catch (err) {
          showToast('データの読み込みに失敗しました', 'error');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  // ============ RENDER ALL ============
  function renderAll() {
    CATEGORIES = getCategoryMap();
    renderDashboard();
    renderWorks();
    renderCategories();
    renderNews();
    renderInquiries();
    renderSettings();
  }

  // ============ AUTH ============
  const auth = firebase.auth();
  const loginScreen = document.getElementById('login-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  // 認証状態を監視
  auth.onAuthStateChanged(user => {
    if (user) {
      // ログイン済み → 管理画面を表示
      loginScreen.style.display = 'none';
      DB.init()
        .then(() => { initSampleData(); initCategories(); renderAll(); })
        .catch(e => { console.error('[Admin] Firestore初期化失敗:', e); initSampleData(); initCategories(); renderAll(); });
    } else {
      // 未ログイン → ログイン画面を表示
      loginScreen.style.display = 'flex';
    }
  });

  // ログイン処理
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    loginError.style.display = 'none';
    loginBtn.textContent = '認証中...';
    loginBtn.disabled = true;
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (e) {
      loginError.style.display = 'block';
      loginBtn.textContent = 'ログイン';
      loginBtn.disabled = false;
    }
  });

  // Enterキーでログイン
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // ログアウト処理
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut();
    });
  }

});

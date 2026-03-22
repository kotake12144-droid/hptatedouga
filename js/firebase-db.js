/* ==========================================
   タテドウガ - Firebase Firestore データ層
   ========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCjT174L10NOXVhN9ZJdQFHcTQjwLG5388",
  authDomain: "tatedouga-c220e.firebaseapp.com",
  projectId: "tatedouga-c220e",
  storageBucket: "tatedouga-c220e.firebasestorage.app",
  messagingSenderId: "331518956939",
  appId: "1:331518956939:web:43a087e1a916bfc2c68b8e"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const _db = firebase.firestore();
const _META = 'meta';

// インメモリキャッシュ（同期アクセス用）
const _cache = {
  works: [],
  news: [],
  inquiries: [],
  categories: [],
  settings: {}
};

// Firestoreから全データをキャッシュに読み込む
async function _dbInit() {
  const snap = await _db.collection(_META).get();
  snap.forEach(doc => {
    const key = doc.id;
    const data = doc.data();
    if (key === 'settings') {
      _cache.settings = data || {};
    } else if (data && Array.isArray(data.items)) {
      if (Object.prototype.hasOwnProperty.call(_cache, key)) {
        _cache[key] = data.items;
      }
    }
  });
}

// Firestore書き込み（キャッシュは即時更新、DB書き込みは非同期）
function _dbWrite(key, data) {
  _db.collection(_META).doc(key).set({ items: data })
    .catch(e => console.error('[DB] 書き込みエラー:', key, e));
}
function _dbWriteSettings(data) {
  _db.collection(_META).doc('settings').set(data)
    .catch(e => console.error('[DB] 設定書き込みエラー:', e));
}

window.DB = {
  // 初期化（Firestore → キャッシュ）
  init: _dbInit,

  // 読み取り（同期・キャッシュから）
  get(key) {
    return JSON.parse(JSON.stringify(_cache[key] || []));
  },
  getSettings() {
    return JSON.parse(JSON.stringify(_cache.settings || {}));
  },

  // 書き込み（キャッシュ即時更新 + Firestore非同期）
  set(key, data) {
    _cache[key] = JSON.parse(JSON.stringify(data));
    _dbWrite(key, data);
  },
  setSettings(data) {
    _cache.settings = JSON.parse(JSON.stringify(data));
    _dbWriteSettings(data);
  }
};

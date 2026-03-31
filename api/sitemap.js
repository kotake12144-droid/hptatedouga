const https = require('https');

const BASE_URL = 'https://www.tatedouga.jp';
const PROJECT_ID = 'tatedouga-c220e';
const API_KEY = 'AIzaSyCjT174L10NOXVhN9ZJdQFHcTQjwLG5388';

const STATIC_PAGES = [
  { url: '/',             priority: '1.0', changefreq: 'weekly' },
  { url: '/works.html',   priority: '0.9', changefreq: 'weekly' },
  { url: '/inquiry.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/flow.html',    priority: '0.7', changefreq: 'monthly' },
  { url: '/about.html',   priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const today = new Date().toISOString().split('T')[0];
  let workUrls = [];

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/meta/works?key=${API_KEY}`;
    const data = await httpsGet(url);
    const values = data?.fields?.items?.arrayValue?.values || [];
    workUrls = values
      .map(v => {
        const f = v?.mapValue?.fields;
        if (!f) return null;
        const id = f.id?.integerValue || f.id?.stringValue;
        return id ? { url: `/works/${id}`, priority: '0.8', changefreq: 'monthly' } : null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error('[sitemap] Firestore fetch failed:', e);
  }

  const allPages = [...STATIC_PAGES, ...workUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).send(xml);
};

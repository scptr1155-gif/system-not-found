import { cfg } from './config.js';

const BASE = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;
const FILE_API = `${BASE}/contents/${cfg.path}`;

const headers = () => ({
  Authorization: `Bearer ${cfg.token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
});

const CACHE_MS = 30_000;
let cache = null;

async function repoExists() {
  const r = await fetch(BASE, { headers: headers() });
  return r.ok;
}

export async function readDb(fresh = false) {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const r = await fetch(FILE_API, { headers: headers() });
  let value;

  if (r.status === 404) {
    if (!(await repoExists())) {
      throw new Error(`Repo bulunamadı veya token erişimi yok: ${cfg.owner}/${cfg.repo}`);
    }
    value = { data: { bots: {} }, sha: null };
  } else if (!r.ok) {
    throw new Error(`GitHub okuma hatası: ${r.status}`);
  } else {
    const j = await r.json();
    value = {
      data: JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')),
      sha: j.sha,
    };
  }

  cache = { at: Date.now(), value };
  return value;
}

export async function updateDb(mutator, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const { data, sha } = await readDb(true);
    const next = mutator(structuredClone(data));

    const body = {
      message: `db: ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(next, null, 2)).toString('base64'),
      ...(sha && { sha }),
    };

    const r = await fetch(FILE_API, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (r.ok) {
      cache = null;
      return next;
    }
    if (r.status !== 409 && r.status !== 422) {
      throw new Error(`GitHub yazma hatası: ${r.status}`);
    }
  }
  throw new Error('GitHub yazma çakışması, tekrar dene');
}
